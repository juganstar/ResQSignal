from django.urls import path
from emergency.views.alert_views import TriggerEmergencyAlert
from emergency.views.contact_views import ContactListCreate, ContactDetail
from emergency.views.public_views import TriggerPublicAlertView, public_alert_page, test_alert_page
from emergency.views.misc_views import get_csrf_token, alert_page, PublicAlertStatusCheck
from emergency.views import public_views
from .views import dynamic_manifest

urlpatterns = [
    # Alert endpoints
    path('trigger/', TriggerEmergencyAlert.as_view(), name='trigger-alert'),
    path('public/<uuid:token>/', TriggerPublicAlertView.as_view(), name='public-alert'),
    path('public-page/<uuid:token>/', public_alert_page, name='public-alert-page'),
    path('test/<uuid:token>/', test_alert_page, name='test-alert'),
    path("manifest/<uuid:token>.json", dynamic_manifest, name="dynamic-manifest"),

    # Contact endpoints
    path('contacts/', ContactListCreate.as_view(), name='contact-list'),
    path('contacts/<int:pk>/', ContactDetail.as_view(), name='contact-detail'),

    # CSRF and pages
    path('alert-page/', alert_page, name='alert_page'),
    path('csrf/', get_csrf_token, name='get_csrf'),
    path("public/<uuid:token>/test-connection/", PublicAlertStatusCheck.as_view(), name="public-alert-status"),
]
