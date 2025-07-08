from billing.models import Subscription


def get_user_plan(user):
    profile = user.profile

    # Priority 1: Real Stripe subscription
    subscription = Subscription.objects.filter(user=user, status="active").first()
    if subscription and subscription.plan in ["basic", "premium"]:
        return subscription.plan

    # Priority 2: Free users get premium features
    if profile.is_free_user:
        return "premium"

    # Priority 3: Subscribed users with profile.plan set
    if profile.is_subscribed and profile.plan in ["basic", "premium"]:
        return profile.plan

    # Fallback
    return "none"
