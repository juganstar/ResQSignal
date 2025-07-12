from allauth.account.adapter import DefaultAccountAdapter
from allauth.account.utils import user_email
from django.contrib.sites.shortcuts import get_current_site
from django.urls import reverse


class CustomAccountAdapter(DefaultAccountAdapter):
    def get_email_confirmation_context(self, request, emailconfirmation):
        # Manually build confirmation link for EmailConfirmationHMAC
        activate_url = request.build_absolute_uri(
            reverse("account_confirm_email", args=[emailconfirmation.key])
        )

        return {
            "user": emailconfirmation.email_address.user,
            "activate_url": activate_url,
            "current_site": self.get_current_site(request),
            "key": emailconfirmation.key,
        }

    def send_confirmation_mail(self, request, emailconfirmation, signup):
        ctx = self.get_email_confirmation_context(request, emailconfirmation)
        self.send_mail("account/email/email_confirmation", emailconfirmation.email_address.email, ctx)


    def get_current_site(self, request):
        return get_current_site(request)
