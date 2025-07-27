from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from django.conf import settings

import stripe
import os

from users.models import Profile


class BillingPortalView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        stripe.api_key = settings.STRIPE_SECRET_KEY

        customer_id = request.user.profile.stripe_customer_id
        if not customer_id:
            return Response({"error": "Stripe customer not found."}, status=400)

        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url="http://localhost:5173/setup"
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

    # ✅ Garantir que já tem cartão confirmado
    if not profile.payment_method_added:
        return Response({"detail": "Método de pagamento necessário."}, status=400)

    # ✅ Ativar trial
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

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        from .webhook_handlers import handle_checkout_session_completed
        handle_checkout_session_completed(session)

    elif event["type"] == "customer.subscription.created":
        subscription = event["data"]["object"]
        from .webhook_handlers import handle_subscription_created
        handle_subscription_created(subscription)

    elif event["type"] == "customer.subscription.updated":
        subscription = event["data"]["object"]
        from .webhook_handlers import handle_subscription_updated
        handle_subscription_updated(subscription)

    return HttpResponse(status=200)
