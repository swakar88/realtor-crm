from rest_framework import viewsets, permissions
from .models import Contact, Property, Transaction
from .serializers import ContactSerializer, PropertySerializer, TransactionSerializer
from accounts.models import Organization

class BaseTransactionViewSet(viewsets.ModelViewSet):
    """Base ViewSet to handle organization filtering and creation."""
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):        
        user = self.request.user
        if user.is_superuser:
            return self.queryset.all()
            
        if not hasattr(user, 'organization') or not user.organization:
            # Return empty queryset if no active organization
            return self.queryset.none()
        return self.queryset.filter(organization=user.organization)

    def perform_create(self, serializer):
        user = self.request.user
        if not hasattr(user, 'organization') or not user.organization:
            # Auto-onboarding for superusers/first-time users
            # Import inside method to avoid potential circular dep if models cross-reference, though Organization is in accounts
            org_name = f"{user.username}'s Agency"
            # get_or_create to avoid duplicates if multiple requests come in
            org, created = Organization.objects.get_or_create(name=org_name)
            user.organization = org
            user.save()
            
        serializer.save(organization=user.organization)

class ContactViewSet(BaseTransactionViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer

class PropertyViewSet(BaseTransactionViewSet):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer

class TransactionViewSet(BaseTransactionViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
