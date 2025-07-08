from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import RegexValidator
from phonenumber_field.modelfields import PhoneNumberField

User = get_user_model()

class EmergencyAlert(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    message = models.TextField(blank=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    is_test = models.BooleanField(default=False)

    def __str__(self):
        prefix = "[TEST] " if self.is_test else ""
        return f"EmergencyAlert from {self.user.username} at {self.created_at}"

class Contact(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="contacts")
    name = models.CharField(max_length=100)
    phone_number = PhoneNumberField()
    #email = models.EmailField(blank=True) #decided to remove email for this bracker, useless
    relationship = models.CharField(max_length=50, blank=True)

    class Meta:
        unique_together = ['user', 'phone_number']  # ✅ Enforces per-user uniqueness

    def __str__(self):
        return f"{self.name} ({self.phone_number})"