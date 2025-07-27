# Django core imports
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.utils.decorators import method_decorator
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.contrib.auth import logout, get_user_model
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator

# Django Allauth
from allauth.account.adapter import get_adapter
from allauth.account.models import EmailAddress
from allauth.account.utils import send_email_confirmation

# DRF
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import AuthenticationFailed

# dj-rest-auth
from dj_rest_auth.views import PasswordResetView as DRFPasswordResetView

# Local
from .serializers import CustomRegisterSerializer
from users.models import Profile
from users.serializers import UserDetailsSerializer
from users.serializers import CustomTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

User = get_user_model()


# 🌡️ Health check
class HealthCheck(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"status": "ok"})


# 🔐 JWT login
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


# 👤 Authenticated user info
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    user = request.user
    serializer = UserDetailsSerializer(user)
    data = serializer.data
    try:
        data['token'] = str(user.profile.token)
    except (Profile.DoesNotExist, AttributeError):
        data['token'] = None
    data['is_authenticated'] = True
    return Response(data)


# Trial activation
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def request_trial(request):
    profile = request.user.profile

    print("🧪 Trial debug:")
    print("has_used_trial:", profile.has_used_trial)
    print("payment_method_added:", profile.payment_method_added)
    print("trial_start:", profile.trial_start)

    # Já usou trial?
    if profile.has_used_trial:
        print("🛑 Blocked: already used trial")
        return Response({"error": "Já usaste o período experimental."}, status=400)

    # Não adicionou cartão?
    if not profile.payment_method_added:
        print("🛑 Blocked: payment method not added")
        return Response({"error": "Método de pagamento necessário."}, status=400)

    # Ativar o trial
    profile.start_trial()
    print("✅ Trial started")
    return Response({"success": "Período experimental ativado com sucesso!"})


# 📝 User registration
class UserRegistrationView(generics.CreateAPIView):
    serializer_class = CustomRegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save(request=request)
            return Response(
                {
                    "detail": "Account created successfully!",
                    "user": {
                        "id": user.id,
                        "username": user.username
                    }
                },
                status=status.HTTP_201_CREATED
            )
        return Response(
            {"errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )


# 🔒 Password Reset Flow
def filter_users_by_email(email):
    return User.objects.filter(email__iexact=email)


class CustomPasswordResetView(DRFPasswordResetView):
    def generate_reset_url(self, user, token):
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        path = settings.ACCOUNT_PASSWORD_RESET_CONFIRM_URL.format(uid=uid, token=token)
        domain = getattr(settings, "FRONTEND_DOMAIN", "localhost:5173")
        protocol = getattr(settings, "ACCOUNT_DEFAULT_HTTP_PROTOCOL", "http")
        return f"{protocol}://{domain}/{path}"

    def post(self, request, *args, **kwargs):
        email = request.data.get("email", "").strip().lower()
        if not email:
            return Response({"detail": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        users = filter_users_by_email(email)
        if not users:
            return Response({"detail": "Password reset e-mail has been sent."}, status=status.HTTP_200_OK)

        for user in users:
            token = default_token_generator.make_token(user)
            url = self.generate_reset_url(user, token)
            get_adapter().send_mail(
                "account/email/password_reset_key",
                email,
                {"password_reset_url": url, "user": user}
            )

        return Response({"detail": "Password reset e-mail has been sent."}, status=status.HTTP_200_OK)


class CustomPasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uidb64 = request.data.get("uid")
        token = request.data.get("token")
        password1 = request.data.get("new_password1")
        password2 = request.data.get("new_password2")

        if not all([uidb64, token, password1, password2]):
            return Response({"detail": "Missing required fields."}, status=status.HTTP_400_BAD_REQUEST)

        if password1 != password2:
            return Response({"detail": "Passwords do not match."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"detail": "Invalid user."}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({"detail": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(password1)
        user.save()

        return Response({"detail": "Password has been reset."}, status=status.HTTP_200_OK)


# 🗑️ Delete account
class DeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        request.user.delete()
        return Response({"detail": "Account deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
    
    
class CustomResendEmailVerificationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        print("📩 Resend email requested:", email)

        if not email:
            return Response({"detail": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        email_address = EmailAddress.objects.filter(email__iexact=email).first()
        print("📩 EmailAddress found:", email_address)

        if email_address and not email_address.verified:
            send_email_confirmation(request, email_address.user, signup=False)
            print("✅ Verification email sent.")
            return Response({"detail": "Verification email sent."}, status=status.HTTP_200_OK)

        print("⚠️ Email not found or already verified.")
        return Response({"detail": "Email not found or already verified."}, status=status.HTTP_400_BAD_REQUEST)