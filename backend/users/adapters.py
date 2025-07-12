from allauth.account.adapter import DefaultAccountAdapter
from django.template.loader import render_to_string
from django.core.mail import EmailMessage
from django.conf import settings

class CustomAccountAdapter(DefaultAccountAdapter):
    def send_confirmation_mail(self, request, emailconfirmation, signup):
        ctx = self.get_email_confirmation_context(request, emailconfirmation)
        to_email = emailconfirmation.email_address.email

        # Render templates
        subject = render_to_string("account/email/email_confirmation_subject.txt", ctx).strip()
        message = render_to_string("account/email/email_confirmation_message.txt", ctx)

        # Send email
        msg = EmailMessage(subject, message, to=[to_email])
        msg.send()
