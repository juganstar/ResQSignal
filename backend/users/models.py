from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.middleware.csrf import get_token
from django.views.decorators.http import require_GET
from django.http import JsonResponse

import uuid

class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser with added protection
    against superuser account takeover.
    """
    class Meta:
        default_related_name = 'custom_user'  # Prevents reverse accessor clashes
    
    def save(self, *args, **kwargs):
        """
        Override save method to:
        1. Prevent superuser demotion
        2. Block regular users from taking superuser usernames
        """
        # For existing users
        if self.pk:
            original_user = User.objects.get(pk=self.pk)
            # Prevent superuser demotion
            if original_user.is_superuser and not self.is_superuser:
                raise ValueError("Cannot demote a superuser via update")
        
        # Prevent username collisions with superusers
        if not self.is_superuser and User.objects.filter(
            username__iexact=self.username,  # Case-insensitive check
            is_superuser=True
        ).exclude(pk=self.pk).exists():
            raise ValueError(f"Username '{self.username}' is reserved for admin")
        
        # Normalize username to lowercase
        self.username = self.username.lower()
        super().save(*args, **kwargs)

class Profile(models.Model):
    PLAN_CHOICES = [
        ("none", "No Plan"),
        ("basic", "Basic Plan"),
        ("premium", "Premium Plan"),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name='profile'
    )
    phone_number = models.CharField(max_length=20, blank=True)
    emergency_contact = models.CharField(max_length=100, blank=True)
    is_subscribed = models.BooleanField(default=False)
    is_free_user = models.BooleanField(default=False)
    stripe_customer_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        unique=True
    )
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    
    plan = models.CharField(
        max_length=10,
        choices=PLAN_CHOICES,
        default="none"
    )

    # ✅ New field
    first_alert_sent = models.BooleanField(default=False)

    def get_effective_plan(self):
        if self.is_free_user or self.is_subscribed:
            return "premium"
        return self.plan or "none"

    def __str__(self):
        return f"{self.user.username}'s Profile"



@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    """Ensure every user has a profile created/updated on save"""
    if created:
        Profile.objects.create(user=instance)
    instance.profile.save()

@require_GET
def csrf_token_view(request):
    return JsonResponse({'csrfToken': get_token(request)})