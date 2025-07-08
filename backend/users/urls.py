from django.urls import path
from django.contrib.auth import views as auth_views
from dj_rest_auth.views import LoginView  # ✅ use dj-rest-auth built-ins
from .views import (
    HealthCheck,
    current_user,
    UserRegistrationView,
    csrf_token_view,
    CustomLoginView,
    CustomLogoutView,
    CustomPasswordResetView,
    CustomPasswordResetConfirmView,
    DeleteAccountView
)

urlpatterns = [
    path("health/", HealthCheck.as_view(), name="health-check"),
    path("me/", current_user, name="current_user"),
    path("registration/", UserRegistrationView.as_view(), name="user-registration"),
    path("csrf/", csrf_token_view, name="csrf-token"),
    path("auth/login/", CustomLoginView.as_view(), name="rest_login"),
    path("auth/logout/", CustomLogoutView.as_view(), name="rest_logout"),
    path("reset-password/", CustomPasswordResetView.as_view(), name="reset-password"),
    path("reset-password-confirm/", CustomPasswordResetConfirmView.as_view(), name="password_reset_confirm"),
    path("delete-account/", DeleteAccountView.as_view(), name="delete-account"),
]
