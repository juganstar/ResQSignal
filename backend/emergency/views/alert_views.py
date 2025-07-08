from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from emergency.models import EmergencyAlert, Contact
from emergency.utils import send_emergency_message
from billing.utils import add_stripe_usage

class TriggerEmergencyAlert(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile = request.user.profile

        if not (profile.is_subscribed or profile.is_free_user):
            return Response(
                {"error": "⚠️ Plano inativo. Por favor subscreva ou contacte suporte."},
                status=403
            )

        message = request.data.get("message", "")
        alert = EmergencyAlert.objects.create(user=request.user, message=message)
        contacts = Contact.objects.filter(user=request.user)

        message_count = 0
        for contact in contacts:
            send_emergency_message(contact, request.user, message)
            message_count += 1

        add_stripe_usage(request.user, quantity=message_count)

        return Response({"status": "alert triggered", "id": alert.id})