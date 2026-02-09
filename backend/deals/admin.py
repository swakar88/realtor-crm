from django.contrib import admin
from .models import Deal

@admin.register(Deal)
class DealAdmin(admin.ModelAdmin):
    list_display = ('title', 'get_contact_name', 'stage', 'value', 'probability', 'closing_date', 'user')
    list_filter = ('stage', 'user')
    search_fields = ('title', 'contact__first_name', 'contact__last_name')

    def get_contact_name(self, obj):
        return f"{obj.contact.first_name} {obj.contact.last_name}" if obj.contact else "Unknown"
    get_contact_name.short_description = 'Client Name'
