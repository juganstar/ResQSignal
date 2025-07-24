from django.urls import path
from .stripe_webhooks import create_billing_portal_session, create_checkout_session
from .views import request_trial

urlpatterns = [
    path("portal/", create_billing_portal_session, name="billing-portal"),
    path("checkout/", create_checkout_session, name="create-checkout"),
    path("trial/request/", request_trial, name="request_trial"),
]
