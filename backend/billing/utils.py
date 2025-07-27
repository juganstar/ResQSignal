import stripe
import time
from billing.models import Subscription

def add_stripe_usage(user, quantity=1):
    try:
        sub = Subscription.objects.get(user=user, status="active")
        if not sub.subscription_item_id:
            print("❌ Missing subscription_item_id")
            return

        stripe.UsageRecord.create(
            subscription_item=sub.subscription_item_id,
            quantity=quantity,
            timestamp=int(time.time()),
            action="increment",
        )
        print(f"✅ Reported {quantity} usage for {user.email}")
    except Exception as e:
        print(f"❌ Failed to report usage: {e}")
