from django.contrib import admin
from .models import Property, Contact, Transaction

@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('address', 'city', 'list_price', 'status', 'created_at')
    search_fields = ('address', 'city')
    list_filter = ('status', 'property_type', 'organization')

@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'email', 'role', 'phone')
    search_fields = ('first_name', 'last_name', 'email')
    list_filter = ('role', 'organization')

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('name', 'property', 'contact', 'stage', 'value', 'close_date')
    list_filter = ('stage', 'organization')
    search_fields = ('name', 'property__address', 'contact__first_name', 'contact__last_name')
