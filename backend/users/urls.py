from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from .views import (
    HealthCheck,
    current_user,
    UserRegistrationView,
    csrf_token_view,
    CustomPasswordResetView,
    CustomPasswordResetConfirmView,
    DeleteAccountView,
)

urlpatterns = [
    path("health/", HealthCheck.as_view(), name="health-check"),
    path("me/", current_user, name="current_user"),
    path("registration/", UserRegistrationView.as_view(), name="user-registration"),
    path("csrf/", csrf_token_view, name="csrf-token"),

    # ✅ JWT Auth endpoints
    path("auth/login/", TokenObtainPairView.as_view(), name="jwt-login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="jwt-refresh"),
    path("auth/verify/", TokenVerifyView.as_view(), name="jwt-verify"),

    path("reset-password/", CustomPasswordResetView.as_view(), name="reset-password"),
    path("reset-password-confirm/", CustomPasswordResetConfirmView.as_view(), name="password_reset_confirm"),
    path("delete-account/", DeleteAccountView.as_view(), name="delete-account"),
]
