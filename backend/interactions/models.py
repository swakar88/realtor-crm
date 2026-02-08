from django.db import models
from django.conf import settings
from accounts.models import Organization

class Task(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='tasks')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='assigned_tasks')
    title = models.CharField(max_length=255)
    is_completed = models.BooleanField(default=False)
    due_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Event(models.Model):
    TYPE_CHOICES = [
        ('Call', 'Call'),
        ('Meeting', 'Meeting'),
        ('Email', 'Email'),
        ('Other', 'Other'),
    ]
    
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='events')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='events')
    title = models.CharField(max_length=255)
    start_time = models.DateTimeField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='Meeting')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
