import os
import stripe
from django.conf import settings

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

from users.models import Profile

stripe.api_key = getattr(settings, "STRIPE_SECRET_KEY", os.getenv("STRIPE_SECRET_KEY"))


class BillingPortalView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        customer_id = request.user.profile.stripe_customer_id
        if not customer_id:
            return Response({"error": "Stripe customer not found."}, status=400)

        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=os.getenv("BILLING_PORTAL_RETURN_URL", "https://resqsignal.com/setup")
        )
        return Response({"url": session.url})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def request_trial(request):
    profile = request.user.profile

    if profile.has_used_trial:
        return Response({"detail": "O seu período experimental já foi utilizado."}, status=400)

    if profile.trial_start:
        return Response({"detail": "O período experimental já está ativo."}, status=400)

    if not profile.payment_method_added:
        return Response({"detail": "Método de pagamento necessário."}, status=400)

    profile.start_trial()
    return Response({"detail": "Período experimental ativado com sucesso."})
