from django.contrib import admin
from .models import Contact, EmergencyAlert

@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ("name", "phone_number", "user", "relationship")
    list_filter = ("user",)
    search_fields = ("name", "phone_number", "user__username")

@admin.register(EmergencyAlert)
class EmergencyAlertAdmin(admin.ModelAdmin):
    list_display = ("user", "created_at", "message")
    list_filter = ("user",)
    search_fields = ("user__username", "message")
