# billing/views.py
from rest_framework.views import APIView, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import stripe
from django.conf import settings
from users.models import Profile

class BillingPortalView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        stripe.api_key = settings.STRIPE_SECRET_KEY

        customer_id = request.user.profile.stripe_customer_id
        if not customer_id:
            return Response({"error": "Stripe customer not found."}, status=400)

        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url="http://localhost:5173/setup"
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

    if profile.payment_method_added or profile.stripe_customer_id:
        # Card might already be present; activate immediately
        profile.start_trial()
        return Response({"detail": "Período experimental ativado com sucesso."})

    # Just mark trial intent; will be activated after Stripe checkout completes
    profile.has_used_trial = False
    profile.save()
    return Response({"detail": "Período experimental solicitado. Ative-o após adicionar um método de pagamento."})