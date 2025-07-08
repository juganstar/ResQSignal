from django.contrib import admin
from django.urls import path, include, re_path
from django.urls.resolvers import URLPattern
from allauth.account.views import confirm_email

from emergency.views.public_views import public_alert_page, test_alert_page, TriggerPublicAlertView
from emergency.views.misc_views import get_csrf_token
from billing.stripe_webhooks import stripe_webhook

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Admin
    path("admin/", admin.site.urls),

    # AllAuth
    path("accounts/", include("allauth.urls")),

    # dj-rest-auth
    path("api/auth/", include("dj_rest_auth.urls")),
    path("api/auth/registration/", include("dj_rest_auth.registration.urls")),
    path("api/users/verify-email/<str:key>/", confirm_email, name="account_confirm_email"),

    # CSRF
    path("api/csrf/", get_csrf_token, name="csrf_token"),

    # App routes
    path("api/users/", include("users.urls")),
    path("api/emergency/", include("emergency.urls")),
    path("api/billing/", include("billing.urls")),

    # Stripe Webhook
    path("stripe/webhook/", stripe_webhook, name="stripe_webhook"),

    # Public Emergency Trigger
    path("public/<uuid:token>/", public_alert_page, name="public-alert-page"),
    path("test/<uuid:token>/", test_alert_page, name="test-alert"),
    path("api/emergency/public/<uuid:token>/", TriggerPublicAlertView.as_view(), name="public-alert-api"),
]

# Optional deduplication cleanup
urlpatterns = list({
    pattern.pattern if isinstance(pattern, URLPattern) else str(pattern): pattern
    for pattern in urlpatterns
}.values())

# 🔧 Serve static files (admin CSS) in production
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
