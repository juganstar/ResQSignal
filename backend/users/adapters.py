from allauth.account.adapter import DefaultAccountAdapter
from allauth.account.utils import user_email


class CustomAccountAdapter(DefaultAccountAdapter):
    def send_confirmation_mail(self, request, emailconfirmation, signup):
        # ✅ Método manual para substituir o que estava a falhar
        ctx = {
            "user": emailconfirmation.email_address.user,
            "current_site": self.get_current_site(request),
            "key": emailconfirmation.key,
            "activate_url": self.get_email_confirmation_url(request, emailconfirmation),
        }
        email = user_email(emailconfirmation.email_address.user)
        self.send_mail("account/email/email_confirmation_message", email, ctx)

