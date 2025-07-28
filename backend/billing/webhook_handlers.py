import os
import stripe
from django.conf import settings
from billing.models import Subscription
from users.models import Profile

stripe.api_key = getattr(settings, "STRIPE_SECRET_KEY", os.getenv("STRIPE_SECRET_KEY"))


def handle_checkout_session_completed(session):
    customer_id = session.get('customer')
    subscription_id = session.get('subscription')

    if not customer_id or not subscription_id:
        print("❌ Faltam customer_id ou subscription_id")
        return

    try:
        subscription_data = stripe.Subscription.retrieve(subscription_id)
        item_data = subscription_data['items']['data'][0]
        item_id = item_data['id']
        price_id = item_data['price']['id']
    except Exception as e:
        print(f"❌ Erro ao obter dados da subscrição: {e}")
        return

    plan = "unknown"
    if price_id == getattr(settings, "STRIPE_BASIC_PRICE_ID", os.getenv("STRIPE_BASIC_PRICE_ID")):
        plan = "basic"
    elif price_id == getattr(settings, "STRIPE_PREMIUM_PRICE_ID", os.getenv("STRIPE_PREMIUM_PRICE_ID")):
        plan = "premium"

    try:
        customer = stripe.Customer.retrieve(customer_id)
        customer_email = customer.email
    except Exception as e:
        print(f"⚠️ Não foi possível obter o email do cliente: {e}")
        customer_email = None

    try:
        profile = Profile.objects.get(stripe_customer_id=customer_id)
        user = profile.user
    except Profile.DoesNotExist:
        print(f"❌ Perfil não encontrado para customer_id {customer_id}")
        return

    profile.payment_method_added = True

    if not profile.has_used_trial and not profile.trial_start:
        profile.start_trial()
        print(f"🚀 Trial ativado para {user.username}")

    profile.save()

    Subscription.objects.update_or_create(
        stripe_customer_id=customer_id,
        defaults={
            "user": user,
            "email": customer_email,
            "stripe_subscription_id": subscription_id,
            "plan": plan,
            "status": "active",
            "subscription_item_id": item_id,
        }
    )

    print(f"✅ Subscrição guardada para {customer_email or 'sem email'} ({plan})")


def handle_subscription_created(subscription):
    sub_id = subscription.get('id', 'desconhecido')
    print(f"📦 Subscrição criada: {sub_id}")


def handle_subscription_updated(subscription):
    sub_id = subscription.get('id', 'desconhecido')
    print(f"🔄 Subscrição atualizada: {sub_id}")
