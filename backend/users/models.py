from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.views.decorators.http import require_GET
from django.http import JsonResponse

from django.utils import timezone
from datetime import timedelta
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
        if self.pk:
            original_user = User.objects.get(pk=self.pk)
            if original_user.is_superuser and not self.is_superuser:
                raise ValueError("Cannot demote a superuser via update")

        if not self.is_superuser and User.objects.filter(
            username__iexact=self.username,
            is_superuser=True
        ).exclude(pk=self.pk).exists():
            raise ValueError(f"Username '{self.username}' is reserved for admin")

        self.username = self.username.lower()
        super().save(*args, **kwargs)


from django.utils import timezone
from datetime import timedelta

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
    first_alert_sent = models.BooleanField(default=False)

    # ✅ Trial
    trial_start = models.DateTimeField(null=True, blank=True)
    has_used_trial = models.BooleanField(default=False)  # 🔐 avoid re-use
    payment_method_added = models.BooleanField(default=False)  # ✅ Stripe card check

    def get_effective_plan(self):
        if self.is_free_user or self.is_subscribed:
            return "premium"
        return self.plan or "none"

    def has_premium_access(self):
        if self.get_effective_plan() == "premium":
            return True
        if self.trial_start and timezone.now() < self.trial_start + timedelta(days=3):
            return True
        return False

    def is_trial_active(self):
        return (
            self.trial_start is not None and
            timezone.now() < self.trial_start + timedelta(days=3)
        )

    def start_trial(self):
        self.trial_start = timezone.now()
        self.has_used_trial = True
        self.save()

    def __str__(self):
        return f"{self.user.username}'s Profile"



@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    profile, _ = Profile.objects.get_or_create(user=instance)
    profile.save()
