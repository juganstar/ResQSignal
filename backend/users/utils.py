from datetime import timedelta
from django.utils import timezone

def get_user_plan(user):
    profile = user.profile

    # Priority 1: Real Stripe subscription
    subscription = Subscription.objects.filter(user=user, status="active").first()
    if subscription and subscription.plan in ["basic", "premium"]:
        return subscription.plan

    # Priority 2: Trial (calculate on the fly)
    if profile.trial_start and profile.trial_days:
        trial_end = profile.trial_start + timedelta(days=profile.trial_days)
        if timezone.now() < trial_end:
            return "premium"

    # Priority 3: Free override
    if profile.is_free_user:
        return "premium"

    # Priority 4: Old manual plan fallback
    if profile.is_subscribed and profile.plan in ["basic", "premium"]:
        return profile.plan

    return "none"
