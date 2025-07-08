from rest_framework import generics, serializers, viewsets
from rest_framework.permissions import IsAuthenticated
from emergency.models import Contact
from emergency.serializers import ContactSerializer
from users.utils import get_user_plan

class ContactListCreate(generics.ListCreateAPIView):
    serializer_class = ContactSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Contact.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        user = self.request.user
        plan = get_user_plan(user)

        if plan == "basic":
            max_allowed = 3
        elif plan == "premium":
            max_allowed = 7
        else:
            max_allowed = 0

        current = Contact.objects.filter(user=user).count()
        if current >= max_allowed:
            raise serializers.ValidationError(
                f"CONTACT_LIMIT_REACHED::{max_allowed}::{plan}"
            )           

        serializer.save(user=user)

class ContactDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ContactSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Contact.objects.filter(user=self.request.user)

class ContactViewSet(viewsets.ModelViewSet):
    serializer_class = ContactSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Contact.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)