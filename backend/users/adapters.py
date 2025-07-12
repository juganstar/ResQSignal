from allauth.account.adapter import DefaultAccountAdapter
from django.template.loader import render_to_string
from allauth.account.utils import user_email

class CustomAccountAdapter(DefaultAccountAdapter):
    def send_confirmation_mail(self, request, emailconfirmation, signup):
        ctx = self.get_email_confirmation_context(request, emailconfirmation)  # <-- FIX
        email = user_email(emailconfirmation.email_address.user)
        ctx["email"] = email
        ctx["activate_url"] = emailconfirmation.key  # Optional customization
        self.send_mail(
            "account/email/email_confirmation_subject.txt",
            "account/email/email_confirmation_message.txt",
            ctx,
        )
