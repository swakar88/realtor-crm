from rest_framework import serializers
from .models import Contact, Property, Transaction

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ['id', 'first_name', 'last_name', 'email', 'phone', 'role', 'created_at']
        read_only_fields = ['id', 'created_at']

class PropertySerializer(serializers.ModelSerializer):
    price = serializers.DecimalField(max_digits=12, decimal_places=2, source='list_price')

    class Meta:
        model = Property
        fields = [
            'id', 'address', 'city', 'state', 'zip_code', 'price', 
            'bedrooms', 'bathrooms', 'square_feet', 'property_type', 'status',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class TransactionSerializer(serializers.ModelSerializer):
    type_name = serializers.CharField(source='type.name', read_only=True)
    status_name = serializers.CharField(source='status.name', read_only=True)
    property_address = serializers.CharField(source='property.address', read_only=True)

    class Meta:
        model = Transaction
        fields = ['id', 'organization', 'name', 'property', 'property_address', 'contact', 'contact_name', 'type', 'type_name', 'status', 'status_name', 'stage', 'value', 'close_date', 'commission_rate', 'detailed_status', 'property_type', 'is_archived', 'created_at']
        read_only_fields = ['organization', 'created_at']
        extra_kwargs = {
            'type': {'required': False},
            'status': {'required': False},
            'name': {'required': False}, # We might generate name automatically
        }
