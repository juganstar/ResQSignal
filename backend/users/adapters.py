from allauth.account.adapter import DefaultAccountAdapter
from allauth.account.utils import user_email
from django.contrib.sites.shortcuts import get_current_site
from django.urls import reverse


class CustomAccountAdapter(DefaultAccountAdapter):
    def get_current_site(self, request):
        return get_current_site(request)

    def send_confirmation_mail(self, request, emailconfirmation, signup):
        self.send_mail(
            "account/email/email_confirmation",
            emailconfirmation.email_address.email,
            {
                "user": emailconfirmation.email_address.user,
                "activate_url": request.build_absolute_uri(
                    self.get_email_confirmation_url(request, emailconfirmation)
                ),
                "current_site": self.get_current_site(request),  # this works now
                "key": emailconfirmation.key,
            },
        )