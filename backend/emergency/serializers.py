from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Contact, EmergencyAlert
from django.utils.translation import gettext_lazy as _
from phonenumbers import parse, format_number, PhoneNumberFormat

User = get_user_model()

class ContactSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField()

    class Meta:
        model = Contact
        fields = ['id', 'name', 'phone_number', 'relationship']
        extra_kwargs = {
            'user': {'read_only': True},
            'phone_number': {'required': True}
        }

    def validate_phone_number(self, value):
        """Validate phone number is in E.164 format, has at least 9 digits, and is not duplicated"""
        if not value.startswith("+") or not value[1:].isdigit():
            raise serializers.ValidationError(
                _("Phone number must be in international format (e.g., +351913016860)")
            )

        digits_only = value[1:]
        if len(digits_only) < 9:
            raise serializers.ValidationError(
                _("⚠️ Enter a valid phone number with at least 9 digits.")
            )

        user = self.context['request'].user
        if Contact.objects.filter(user=user, phone_number=value).exists():
            raise serializers.ValidationError(
                _("⚠️ This phone number is already in your contacts.")
            )

        return value


    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class EmergencyAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyAlert
        fields = ['id', 'message', 'created_at', 'is_test']
        read_only_fields = ['created_at', 'is_test']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password')
        extra_kwargs = {'email': {'required': False}}

    def validate_username(self, value):
        value = value.lower()
        if User.objects.filter(username__iexact=value, is_superuser=True).exists():
            raise serializers.ValidationError("This username is reserved")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            is_active=True
        )
        return user