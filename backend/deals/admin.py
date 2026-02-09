from django.contrib import admin
from .models import Deal

@admin.register(Deal)
class DealAdmin(admin.ModelAdmin):
    list_display = ('title', 'contact', 'stage', 'value', 'closing_date', 'user')
    list_filter = ('stage', 'user')
    search_fields = ('title', 'contact__first_name', 'contact__last_name')
