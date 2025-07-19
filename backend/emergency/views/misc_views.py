import uuid
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.utils.decorators import method_decorator
from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status

from users.models import Profile
from emergency.models import Contact
from users.utils import get_user_plan

@ensure_csrf_cookie
def alert_page(request):
    return render(request, 'emergency/alert_page.html')

@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({'csrfToken': get_token(request)})

@method_decorator(csrf_exempt, name='dispatch')
class PublicAlertStatusCheck(APIView):
    permission_classes = [AllowAny]

    def get(self, request, token):
        try:
            uuid.UUID(str(token))
            profile = Profile.objects.get(token=token)
            user = profile.user

            if not profile.has_premium_access():
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
            return Response(
                {"message": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

