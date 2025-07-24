from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.core.validators import validate_email
from django.core.exceptions import ValidationError as DjangoValidationError
from dj_rest_auth.serializers import LoginSerializer
from dj_rest_auth.registration.serializers import RegisterSerializer
from allauth.account.models import EmailAddress
from allauth.account.utils import complete_signup
from allauth.account import app_settings as allauth_settings
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from datetime import timedelta
from django.utils import timezone
from users.models import Profile  # Adjust if your Profile is in another app

User = get_user_model()


# ✅ Custom login: block if email not verified
class CustomLoginSerializer(LoginSerializer):
    def validate(self, attrs):
        user = authenticate(
            request=self.context.get('request'),
            username=attrs.get('username'),
            password=attrs.get('password')
        )

        if user is None:
            raise serializers.ValidationError("Invalid credentials.")

        email_address = EmailAddress.objects.filter(user=user, email=user.email).first()
        if not email_address or not email_address.verified:
            raise serializers.ValidationError("Email not verified. Please check your inbox.")

        attrs['user'] = user
        return attrs


# ✅ JWT login: block token issue if email not verified
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        if not EmailAddress.objects.filter(user=user, email=user.email, verified=True).exists():
            raise serializers.ValidationError({"detail": "EMAIL_NOT_VERIFIED"})

        return data


# ✅ Profile nested info for /api/users/me/
class ProfileSerializer(serializers.ModelSerializer):
    trial_days_left = serializers.SerializerMethodField()
    is_in_trial = serializers.SerializerMethodField()
    has_premium = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = [
            "plan",
            "is_subscribed",
            "is_free_user",
            "trial_days_left",
            "is_in_trial",
            "has_premium",
        ]

    def get_trial_days_left(self, obj):
        if obj.trial_start:
            remaining = obj.trial_start + timedelta(days=3) - timezone.now()
            return max(0, remaining.days)
        return 0

    def get_is_in_trial(self, obj):
        return obj.trial_start and timezone.now() < obj.trial_start + timedelta(days=3)

    def get_has_premium(self, obj):
        return obj.has_premium_access()


# ✅ Used in /api/users/me/
class UserDetailsSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()

    class Meta:
        model = User
        fields = ['pk', 'username', 'email', 'first_name', 'last_name', 'profile']
        read_only_fields = ['email']


from allauth.account.adapter import get_adapter
from allauth.account.utils import setup_user_email
from dj_rest_auth.registration.serializers import RegisterSerializer
from rest_framework import serializers
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email

class CustomRegisterSerializer(RegisterSerializer):
    def validate_email(self, email):
        email = email.lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("Este e-mail já está em uso.")
        try:
            validate_email(email)
        except DjangoValidationError:
            raise serializers.ValidationError("Insira um e-mail válido.")
        return email

    def validate_username(self, username):
        username = username.lower()
        if User.objects.filter(username__iexact=username).exists():
            raise serializers.ValidationError("Já existe um utilizador com este nome.")
        return username

    def save(self, request):
        user = super().save(request)

        complete_signup(
            request,
            user,
            allauth_settings.EMAIL_VERIFICATION,
            None,
        )
        return user
