from django.urls import path
from .views import (
    BillingPortalView,
    create_checkout_session,
    request_trial,
    stripe_webhook,
)

urlpatterns = [
    path("portal/", BillingPortalView.as_view(), name="billing-portal"),
    path("checkout/", create_checkout_session, name="create-checkout"),
    path("trial/request/", request_trial, name="request_trial"),
    path("webhook/", stripe_webhook, name="stripe_webhook"),
]
