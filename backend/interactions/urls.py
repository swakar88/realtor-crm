from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, EventViewSet

router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'events', EventViewSet, basename='event')

urlpatterns = [
    path('', include(router.urls)),
]
