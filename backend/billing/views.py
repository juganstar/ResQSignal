import os
import stripe
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

from users.models import Profile
from .webhook_handlers import (
    handle_checkout_session_completed,
    handle_subscription_created,
    handle_subscription_updated,
)

stripe.api_key = settings.STRIPE_SECRET_KEY


class BillingPortalView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        customer_id = request.user.profile.stripe_customer_id
        if not customer_id:
            return Response({"error": "Stripe customer not found."}, status=400)

        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=os.getenv("BILLING_PORTAL_RETURN_URL", "https://resqsignal.com/setup")
        )
        return Response({"url": session.url})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def request_trial(request):
    profile = request.user.profile

    if profile.has_used_trial:
        return Response({"detail": "O seu período experimental já foi utilizado."}, status=400)

    if profile.trial_start:
        return Response({"detail": "O período experimental já está ativo."}, status=400)

    if not profile.payment_method_added:
        return Response({"detail": "Método de pagamento necessário."}, status=400)

    profile.start_trial()
    return Response({"detail": "Período experimental ativado com sucesso."})


@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    secret = os.getenv("STRIPE_WEBHOOK_SECRET")

    if not secret:
        return HttpResponse("Missing webhook secret", status=500)

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, secret)
    except Exception as e:
        return HttpResponse(f"Webhook error: {e}", status=400)

    event_type = event["type"]

    if event_type == "checkout.session.completed":
        handle_checkout_session_completed(event["data"]["object"])

    elif event_type == "customer.subscription.created":
        handle_subscription_created(event["data"]["object"])

    elif event_type == "customer.subscription.updated":
        handle_subscription_updated(event["data"]["object"])

    else:
        print(f"Unhandled event type: {event_type}")

    return HttpResponse(status=200)
