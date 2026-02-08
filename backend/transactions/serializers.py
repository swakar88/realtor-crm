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
    class Meta:
        model = Transaction
        fields = ['id', 'name', 'property', 'contact', 'type', 'status', 'stage', 'value', 'close_date', 'commission_rate', 'is_archived', 'created_at']
        read_only_fields = ['id', 'created_at']
        extra_kwargs = {
            'type': {'required': False},
            'status': {'required': False},
            'name': {'required': False}, # We might generate name automatically
        }
