from django.contrib import admin
from .models import Task, Event

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'is_completed', 'due_date', 'organization')
    list_filter = ('is_completed', 'user', 'organization')
    search_fields = ('title', 'user__email')

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'start_time', 'type', 'organization')
    list_filter = ('type', 'user', 'organization')
    search_fields = ('title', 'user__email')
