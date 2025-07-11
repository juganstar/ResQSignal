from django.contrib import admin
from django.urls import path, include, re_path
from django.urls.resolvers import URLPattern
from allauth.account.views import confirm_email
from django.views.static import serve as static_serve

from emergency.views.public_views import public_alert_page, test_alert_page, TriggerPublicAlertView
from billing.stripe_webhooks import stripe_webhook

from django.conf import settings
from django.conf.urls.static import static

# ✅ JWT views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.conf import settings
from emergency.views.alert_views import dynamic_manifest


urlpatterns = [
    # Admin Panel
    path("admin/", admin.site.urls),

    # AllAuth (used only for email confirmation URLs)
    path("accounts/", include("allauth.urls")),

    # ✅ JWT Authentication
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Email verification (via AllAuth)
    path("api/users/verify-email/<str:key>/", confirm_email, name="account_confirm_email"),

    # App routes
    path("api/users/", include("users.urls")),
    path("api/emergency/", include("emergency.urls")),
    path("api/billing/", include("billing.urls")),

    # Stripe webhook
    path("stripe/webhook/", stripe_webhook, name="stripe_webhook"),

    # Public Emergency Trigger Pages
    path("public/<uuid:token>/", public_alert_page, name="public-alert-page"),
    path("test/<uuid:token>/", test_alert_page, name="test-alert"),
    path("api/emergency/public/<uuid:token>/", TriggerPublicAlertView.as_view(), name="public-alert-api"),
    re_path(r'^sw\.js$', static_serve, {'path': 'sw.js', 'document_root': settings.STATIC_ROOT}),
    path("manifest/<uuid:token>.json", dynamic_manifest, name="dynamic-manifest"),
]

# Optional deduplication
urlpatterns = list({
    pattern.pattern if isinstance(pattern, URLPattern) else str(pattern): pattern
    for pattern in urlpatterns
}.values())

# Static files (for admin panel)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
