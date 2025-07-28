import os
import stripe
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from django.conf import settings

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from users.models import Profile
from .webhook_handlers import (
    handle_checkout_session_completed,
    handle_subscription_created,
    handle_subscription_updated,
)

# Configura a chave da API da Stripe
stripe.api_key = getattr(settings, "STRIPE_SECRET_KEY", os.getenv("STRIPE_SECRET_KEY"))


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@csrf_exempt
def create_checkout_session(request):
    profile = request.user.profile
    email = request.user.email
    plan = request.data.get("plan")

    # --- map plan → licensed price ---
    if plan == "basic":
        access_price = os.getenv("BASIC_ACCESS_PRICE_ID")
    elif plan == "premium":
        access_price = os.getenv("PREMIUM_ACCESS_PRICE_ID")
    else:
        return Response({'error': 'Plano inválido.'}, status=400)

    # --- SMS metered add-on (same for both plans) ---
    sms_price = os.getenv("SMS_METERED_PRICE_ID")

    try:
        if profile.stripe_customer_id:
            customer_id = profile.stripe_customer_id
        else:
            customer = stripe.Customer.create(email=email)
            customer_id = customer.id
            profile.stripe_customer_id = customer_id
            profile.save()

        session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=['card'],
            mode='subscription',
            line_items=[
                {"price": access_price, "quantity": 1},  # €3 or €5 licensed
                {"price": sms_price,    "quantity": 1},  # €0.10 per SMS metered
            ],
            subscription_data={'trial_period_days': 3},
            success_url='https://resqsignal.com/',
            cancel_url='https://resqsignal.com/cancel/',
        )
        return Response({'url': session.url})

    except Exception as e:
        logger.error("❌ Erro no checkout:", e, exc_info=True)
        return Response({'error': str(e)}, status=500)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_billing_portal_session(request):
    profile = request.user.profile
    customer_id = profile.stripe_customer_id

    if not customer_id:
        return Response({"error": "Nenhum cliente Stripe encontrado."}, status=400)

    try:
        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=os.getenv("BILLING_PORTAL_RETURN_URL", "https://resqsignal.com/setup")
        )
        return Response({"url": session.url})
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    secret = os.getenv("STRIPE_WEBHOOK_SECRET")

    if not secret:
        return HttpResponse("Missing Stripe webhook secret", status=500)

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, secret)
    except Exception as e:
        print("❌ Erro ao verificar assinatura Stripe:", e)
        return HttpResponse(f"Webhook error: {e}", status=400)

    event_type = event.get("type", "")
    data_object = event.get("data", {}).get("object", {})

    print(f"📬 Evento recebido da Stripe: {event_type}")

    if event_type == "checkout.session.completed":
        handle_checkout_session_completed(data_object)

    elif event_type == "customer.subscription.created":
        handle_subscription_created(data_object)

    elif event_type == "customer.subscription.updated":
        handle_subscription_updated(data_object)

    else:
        print(f"⚠️ Evento não tratado: {event_type}")

    return HttpResponse(status=200)
