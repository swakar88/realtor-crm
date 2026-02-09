from django.urls import path
from .views import RegisterView, UserListView, SystemStatsView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('users/', UserListView.as_view(), name='user_list'),
    path('platform-stats/', SystemStatsView.as_view(), name='platform_stats'),
]
