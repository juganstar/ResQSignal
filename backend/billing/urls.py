from django.urls import path
from .views import BillingPortalView, request_trial
from .stripe_webhooks import (
    create_checkout_session,
    stripe_webhook,
    create_billing_portal_session
)

urlpatterns = [
    path("checkout/", create_checkout_session, name="create-checkout"),
    path("portal/", BillingPortalView.as_view(), name="billing-portal"),
    path("trial/request/", request_trial, name="request-trial"),
    path("webhook/", stripe_webhook, name="stripe-webhook"),
]
