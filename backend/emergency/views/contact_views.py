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
        profile = user.profile

        # ✅ Use unified access logic
        if profile.has_premium_access():
            max_allowed = 7  # You decide: full limit for trial users?
        elif profile.get_effective_plan() == "basic":
            max_allowed = 3
        else:
            max_allowed = 0

        current = Contact.objects.filter(user=user).count()
        if current >= max_allowed:
            plan_name = profile.get_effective_plan()
            raise serializers.ValidationError(
                f"CONTACT_LIMIT_REACHED::{max_allowed}::{plan_name}"
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