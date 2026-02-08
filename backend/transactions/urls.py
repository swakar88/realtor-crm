from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContactViewSet, PropertyViewSet, TransactionViewSet

router = DefaultRouter()
router.register(r'contacts', ContactViewSet)
router.register(r'properties', PropertyViewSet)
router.register(r'transactions', TransactionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
