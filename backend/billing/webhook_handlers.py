from billing.models import Subscription
from users.models import Profile
from django.conf import settings
import stripe
import os

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")


def handle_checkout_session_completed(session):
    customer_id = session.get('customer')
    subscription_id = session.get('subscription')

    try:
        subscription_data = stripe.Subscription.retrieve(subscription_id)
        item_data = subscription_data['items']['data'][0]
        item_id = item_data['id']
        price_id = item_data['price']['id']
    except Exception as e:
        print(f"❌ Failed to retrieve subscription data: {e}")
        return

    plan = "unknown"
    if price_id == os.getenv("STRIPE_BASIC_PRICE_ID"):
        plan = "basic"
    elif price_id == os.getenv("STRIPE_PREMIUM_PRICE_ID"):
        plan = "premium"

    try:
        customer = stripe.Customer.retrieve(customer_id)
        customer_email = customer.email
    except Exception as e:
        print(f"⚠️ Could not get customer email: {e}")
        customer_email = None

    try:
        profile = Profile.objects.get(stripe_customer_id=customer_id)
        user = profile.user
    except Profile.DoesNotExist:
        print("❌ No matching profile for customer ID")
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
            "subscription_item_id": item_id,
        }
    )

    print(f"✅ Subscription saved for {customer_email} ({plan})")


def handle_subscription_created(subscription):
    print(f"📦 Subscription created: {subscription.get('id')}")


def handle_subscription_updated(subscription):
    print(f"🔄 Subscription updated: {subscription.get('id')}")
