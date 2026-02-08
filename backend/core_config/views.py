from rest_framework import viewsets, permissions
from .models import TransactionType, TransactionStatus, DateDefinition
from .serializers import TransactionTypeSerializer, TransactionStatusSerializer, DateDefinitionSerializer

class BaseConfigViewSet(viewsets.ModelViewSet):
    """Base ViewSet to handle organization filtering and creation."""
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(organization=self.request.user.organization)

    def perform_create(self, serializer):
        serializer.save(organization=self.request.user.organization)

class TransactionTypeViewSet(BaseConfigViewSet):
    queryset = TransactionType.objects.all()
    serializer_class = TransactionTypeSerializer

class TransactionStatusViewSet(BaseConfigViewSet):
    queryset = TransactionStatus.objects.all()
    serializer_class = TransactionStatusSerializer

class DateDefinitionViewSet(BaseConfigViewSet):
    queryset = DateDefinition.objects.all()
    serializer_class = DateDefinitionSerializer
