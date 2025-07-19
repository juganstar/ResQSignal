from datetime import timedelta
from django.utils import timezone
from billing.models import Subscription


def get_user_plan(user):
    profile = user.profile

    # Priority 1: Real Stripe subscription
    subscription = Subscription.objects.filter(user=user, status="active").first()
    if subscription and subscription.plan in ["basic", "premium"]:
        return subscription.plan

    # Priority 2: Trial (fixed 3-day period)
    if profile.trial_start:
        trial_end = profile.trial_start + timedelta(days=3)
        if timezone.now() < trial_end:
            return "premium"

    # Priority 3: Free override
    if profile.is_free_user:
        return "premium"

    # Priority 4: Old manual plan fallback
    if profile.is_subscribed and profile.plan in ["basic", "premium"]:
        return profile.plan

    return "none"
