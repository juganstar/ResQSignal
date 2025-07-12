from allauth.account.adapter import DefaultAccountAdapter
from django.contrib.sites.shortcuts import get_current_site


class CustomAccountAdapter(DefaultAccountAdapter):
    def send_confirmation_mail(self, request, emailconfirmation, signup):
        ctx = self.get_email_confirmation_context(request, emailconfirmation)
        ctx["current_site"] = self.get_current_site(request)
        self.send_mail("account/email/email_confirmation_message", emailconfirmation.email_address.email, ctx)

    def get_current_site(self, request):
        return get_current_site(request)
