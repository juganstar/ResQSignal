# billing/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import stripe
from django.conf import settings

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
