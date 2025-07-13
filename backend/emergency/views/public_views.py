import uuid
import logging
from django.shortcuts import render, get_object_or_404
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.utils.decorators import method_decorator
from django.http import JsonResponse, HttpResponseBadRequest
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status

from emergency.models import EmergencyAlert, Contact
from emergency.utils import send_emergency_message
from billing.utils import add_stripe_usage
from users.models import Profile
from users.utils import get_user_plan
from billing.models import Subscription
from .twilio_sms import send_sms_alert


logger = logging.getLogger(__name__)

@method_decorator(csrf_exempt, name='dispatch')
class TriggerPublicAlertView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, token):
        try:
            uuid.UUID(str(token))  # Validate UUID format
            profile = Profile.objects.get(token=token)
            user = profile.user

            is_test = request.data.get('is_test', False)
            location = request.data.get("location")

            # Continuous GPS mode (just store and return)
            if request.data.get("continuous"):
                logger.info(f"📍 Continuous GPS update from {user.username}: {location}")
                return Response({
                    "status": "location update received",
                    "type": "continuous"
                })

            # Check subscription
            if not (profile.is_subscribed or profile.is_free_user):
                return Response(
                    {"detail": "Subscription required"},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Get user plan and block location for non-premium
            plan = get_user_plan(user)
            logger.info(f"🔍 User {user.username} has plan: {plan} | Subscribed: {profile.is_subscribed}")

            if location and plan != "premium":
                logger.warning(f"❌ Discarding location for non-premium user {user.username} (plan: {plan})")
                location = None

            message = request.data.get("message", "🚨 Emergency alert!")
            alert = EmergencyAlert.objects.create(
                user=user,
                message=message,
                location=location,
                is_test=is_test
            )

            contacts = Contact.objects.filter(user=user)
            contacts_count = contacts.count()
            successful_sends = 0

            # Check if this is their first real alert
            alert_count = EmergencyAlert.objects.filter(user=user, is_test=False).exclude(id=alert.id).count()
            is_first_real_alert = alert_count == 0

            if not is_test:
                # ⚠️ Define message BEFORE loop
                full_message = f"{message}\n\nLocation: {location}" if location else message

                for contact in contacts:
                    try:
                        send_emergency_message(contact=contact, user=user, message=full_message)
                        successful_sends += 1
                    except Exception as e:
                        logger.error(f"Failed to send alert to contact {contact.id}: {str(e)}")
                        continue

                send_sms_alert(user, full_message)

                # Bill only if it's not their first real alert
                if successful_sends > 0 and not is_first_real_alert:
                    add_stripe_usage(user, quantity=successful_sends)

            return Response({
                "status": "success",
                "contacts_count": contacts_count,
                "successful_sends": successful_sends,
                "failed_sends": contacts_count - successful_sends,
                "location_shared": bool(location),
                "plan": plan,
                "alert_id": alert.id,
                "billing_skipped": is_first_real_alert
            })

        except ValueError:
            return Response(
                {"detail": "Invalid token format"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Profile.DoesNotExist:
            return Response(
                {"detail": "Profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Emergency alert error: {str(e)}", exc_info=True)
            return Response(
                {"detail": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )




@method_decorator(csrf_exempt, name='dispatch')
class PublicAlertStatusCheck(APIView):
    permission_classes = [AllowAny]

    def get(self, request, token):
        try:
            uuid.UUID(str(token))
            profile = Profile.objects.get(token=token)
            user = profile.user

            if not (profile.is_subscribed or profile.is_free_user):
                return Response(
                    {"message": "Account inactive or no subscription."},
                    status=status.HTTP_403_FORBIDDEN
                )

            contact_count = Contact.objects.filter(user=user).count()
            if contact_count == 0:
                return Response(
                    {"message": "No emergency contacts configured."},
                    status=status.HTTP_403_FORBIDDEN
                )

            return Response({
                "plan": get_user_plan(user),
                "contact_count": contact_count,
                "message": "Test successful. Ready to trigger alert."
            })

        except ValueError:
            return Response(
                {"message": "Invalid token format."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Profile.DoesNotExist:
            return Response(
                {"message": "Profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Alert status check error: {str(e)}", exc_info=True)
            return Response(
                {"message": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@ensure_csrf_cookie
def public_alert_page(request, token):
    profile = get_object_or_404(Profile, token=token)
    if not (profile.is_subscribed or profile.is_free_user):
        return render(request, 'emergency/subscription_required.html', {'token': token})
    return render(request, 'emergency/public_alert.html', {'token': token, 'user': profile.user})


@ensure_csrf_cookie
def test_alert_page(request, token):
    try:
        uuid.UUID(str(token))
    except ValueError:
        return HttpResponseBadRequest("Invalid token format")
    return render(request, 'emergency/test_alert.html', {'token': token})
