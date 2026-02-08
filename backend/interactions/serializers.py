from rest_framework import serializers
from .models import Task, Event

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'title', 'is_completed', 'due_date', 'user', 'created_at']
        read_only_fields = ['id', 'created_at', 'user']

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['id', 'title', 'start_time', 'type', 'user', 'created_at']
        read_only_fields = ['id', 'created_at', 'user']
