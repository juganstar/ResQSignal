from billing.models import Subscription
from django.utils import timezone

def get_user_plan(user):
    profile = user.profile

    # Priority 1: Real Stripe subscription
    subscription = Subscription.objects.filter(user=user, status="active").first()
    if subscription and subscription.plan in ["basic", "premium"]:
        return subscription.plan

    # Priority 2: Free user (manually flagged)
    if profile.is_free_user:
        return "premium"

    # Priority 3: Active trial — treat as premium
    if profile.trial_ends_at and profile.trial_ends_at > timezone.now():
        return "premium"

    # Priority 4: Subscribed but no Stripe sub (fallback)
    if profile.is_subscribed and profile.plan in ["basic", "premium"]:
        return profile.plan

    # Fallback
    return "none"
