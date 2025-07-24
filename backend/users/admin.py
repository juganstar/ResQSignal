from django.contrib import admin
from django.contrib.auth.models import Group
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.admin import GroupAdmin as DefaultGroupAdmin
from django import forms
from django.contrib import messages
from django.utils.translation import ngettext

from emergency.models import Contact, EmergencyAlert
from .models import Profile
from billing.models import Subscription
from users.utils import get_user_plan
import users.admin_cleanup
import logging

User = get_user_model()
logger = logging.getLogger(__name__)

# 👇 Inline: Contacts under each user
class ContactInline(admin.TabularInline):
    model = Contact
    extra = 0
    fields = ("name", "phone_number", "email", "relationship")

# ✅ Register User model in admin
@admin.register(User)
class CustomUserAdmin(BaseUserAdmin):
    inlines = [ContactInline]
    list_display = ("username", "email", "is_active", "is_staff", "is_superuser")
    search_fields = ("username", "email")

# ✅ Override Group admin to manage users
class GroupAdminForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['users'] = forms.ModelMultipleChoiceField(
            queryset=User.objects.all(),
            required=False,
            widget=admin.widgets.FilteredSelectMultiple('users', is_stacked=False)
        )
        if self.instance.pk:
            self.fields["users"].initial = self.instance.user_set.all()

    class Meta:
        model = Group
        fields = "__all__"

    def save(self, commit=True):
        group = super().save(commit=False)
        if commit:
            group.save()
        if group.pk:
            group.user_set.set(self.cleaned_data["users"])
            self.save_m2m()
        return group

class CustomGroupAdmin(DefaultGroupAdmin):
    form = GroupAdminForm
    filter_horizontal = ("permissions",)

admin.site.unregister(Group)
admin.site.register(Group, CustomGroupAdmin)

# ✅ Admin for Profile (delete also removes User)
@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = (
        "user", "display_plan", "is_subscribed", "is_free_user",
        "alerts_sent", "contacts_notified"
    )
    list_filter = ("is_subscribed", "is_free_user")
    search_fields = ("user__username", "user__email")
    readonly_fields = ["token", "trial_start"]
    actions = ["delete_profiles_and_users"]

    fields = (
        "user", "phone_number", "emergency_contact", "is_subscribed",
        "is_free_user", "stripe_customer_id", "plan", "token",
        "trial_start", "has_used_trial", "payment_method_added"
    )

    def display_plan(self, obj):
        try:
            return get_user_plan(obj.user)
        except Exception as e:
            logger.error(f"Error in display_plan for user {obj.user}: {e}")
            return "—"
    display_plan.short_description = "Plan"

    def alerts_sent(self, obj):
        return EmergencyAlert.objects.filter(user=obj.user, is_test=False).count()
    alerts_sent.short_description = "Alerts Sent"

    def contacts_notified(self, obj):
        contact_count = Contact.objects.filter(user=obj.user).count()
        alert_count = EmergencyAlert.objects.filter(user=obj.user, is_test=False).count()
        return contact_count * alert_count
    contacts_notified.short_description = "Contacts Notified"

    def delete_model(self, request, obj):
        user = obj.user
        super().delete_model(request, obj)
        user.delete()

    def delete_profiles_and_users(self, request, queryset):
        users = [obj.user for obj in queryset]
        count = len(users)
        for obj in queryset:
            obj.delete()
        for user in users:
            user.delete()
        self.message_user(request, ngettext(
            "%d user was successfully deleted along with their profile.",
            "%d users were successfully deleted along with their profiles.",
            count,
        ) % count, messages.SUCCESS)

    delete_profiles_and_users.short_description = "❌ Delete selected profiles and users"


