from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TransactionTypeViewSet, TransactionStatusViewSet, DateDefinitionViewSet

router = DefaultRouter()
router.register(r'transaction-types', TransactionTypeViewSet)
router.register(r'transaction-statuses', TransactionStatusViewSet)
router.register(r'date-definitions', DateDefinitionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
