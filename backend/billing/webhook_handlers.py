import os
import stripe
from django.conf import settings
from billing.models import Subscription
from users.models import Profile

stripe.api_key = getattr(settings, "STRIPE_SECRET_KEY", os.getenv("STRIPE_SECRET_KEY"))

def handle_checkout_session_completed(session):
    """
    Stripe webhook handler for checkout.session.completed
    Creates / updates Subscription record with:
      - licensed plan (basic or premium)
      - metered SMS add-on item id
    """
    customer_id = session.get('customer')
    subscription_id = session.get('subscription')

    if not customer_id or not subscription_id:
        print("❌ Missing customer_id or subscription_id")
        return

    try:
        # Fetch full subscription with line_items expanded
        subscription_data = stripe.Subscription.retrieve(
            subscription_id,
            expand=['items.data.price']
        )
    except Exception as e:
        print(f"❌ Error retrieving subscription: {e}")
        return

    # Map price IDs to plans
    basic_price_id = getattr(settings, "STRIPE_BASIC_PRICE_ID", os.getenv("STRIPE_BASIC_PRICE_ID"))
    premium_price_id = getattr(settings, "STRIPE_PREMIUM_PRICE_ID", os.getenv("STRIPE_PREMIUM_PRICE_ID"))
    sms_price_id = getattr(settings, "STRIPE_SMS_METERED_PRICE_ID", os.getenv("STRIPE_SMS_METERED_PRICE_ID"))

    plan = "unknown"
    access_item_id = None
    sms_item_id = None

    for item in subscription_data['items']['data']:
        price_id = item['price']['id']
        if price_id == basic_price_id:
            plan = "basic"
            access_item_id = item['id']
        elif price_id == premium_price_id:
            plan = "premium"
            access_item_id = item['id']
        elif price_id == sms_price_id:
            sms_item_id = item['id']

    if plan == "unknown":
        print(f"⚠️ Unknown price IDs in subscription {subscription_id}")
        return

    try:
        customer = stripe.Customer.retrieve(customer_id)
        customer_email = customer.email
    except Exception as e:
        print(f"⚠️ Could not fetch customer email: {e}")
        customer_email = None

    try:
        profile = Profile.objects.get(stripe_customer_id=customer_id)
        user = profile.user
    except Profile.DoesNotExist:
        print(f"❌ Profile not found for customer {customer_id}")
        return

    profile.payment_method_added = True
    if not profile.has_used_trial and not profile.trial_start:
        profile.start_trial()
        print(f"🚀 Trial activated for {user.username}")
    profile.save()

    Subscription.objects.update_or_create(
        stripe_customer_id=customer_id,
        defaults={
            "user": user,
            "email": customer_email,
            "stripe_subscription_id": subscription_id,
            "plan": plan,
            "status": "active",
            "subscription_item_id": access_item_id,   # licensed plan item
            "sms_subscription_item_id": sms_item_id,  # metered SMS item (nullable)
        }
    )

    print(f"✅ Subscription saved for {customer_email or 'no email'} ({plan})")


def handle_subscription_created(subscription):
    sub_id = subscription.get('id', 'desconhecido')
    print(f"📦 Subscrição criada: {sub_id}")


def handle_subscription_updated(subscription):
    sub_id = subscription.get('id', 'desconhecido')
    print(f"🔄 Subscrição atualizada: {sub_id}")
