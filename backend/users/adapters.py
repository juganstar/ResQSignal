from allauth.account.adapter import DefaultAccountAdapter
from allauth.account.utils import user_email
from allauth.account.models import EmailConfirmation
from django.contrib.sites.shortcuts import get_current_site


class CustomAccountAdapter(DefaultAccountAdapter):
    def get_email_confirmation_context(self, request, emailconfirmation):
        """
        Fixes the error:
        AttributeError: 'CustomAccountAdapter' object has no attribute 'get_email_confirmation_context'
        """
        return {
            "user": emailconfirmation.email_address.user,
            "activate_url": emailconfirmation.get_absolute_url(),
            "current_site": self.get_current_site(request),
            "key": emailconfirmation.key,
        }

    def send_confirmation_mail(self, request, emailconfirmation, signup):
        ctx = self.get_email_confirmation_context(request, emailconfirmation)
        self.send_mail(
            "account/email/email_confirmation_message",
            emailconfirmation.email_address.email,
            ctx,
        )

    def get_current_site(self, request):
        return get_current_site(request)
