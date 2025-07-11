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
    
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        if not EmailAddress.objects.filter(user=user, email=user.email, verified=True).exists():
            raise serializers.ValidationError({"detail": "EMAIL_NOT_VERIFIED"})

        return data


# ✅ Used in /api/users/me/
class UserDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['pk', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['email']


# ✅ Custom registration with validation + email confirmation trigger
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
