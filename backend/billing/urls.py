from django.urls import path
from .stripe_webhooks import create_billing_portal_session, create_checkout_session

urlpatterns = [
    path("portal/", create_billing_portal_session, name="billing-portal"),
    path("checkout/", create_checkout_session, name="create-checkout"),
]
