from rest_framework import serializers
from .models import Deal
from transactions.serializers import ContactSerializer
from transactions.models import Contact, Property

class DealSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    
    # Write-only ID fields
    contact_id = serializers.PrimaryKeyRelatedField(
        queryset=Contact.objects.all(), source='contact', write_only=True
    )
    property_id = serializers.PrimaryKeyRelatedField(
        queryset=Property.objects.all(), source='property', write_only=True
    )
    
    # Read-only nested details
    contact_details = ContactSerializer(source='contact', read_only=True)
    # property_details = PropertySerializer(source='property', read_only=True) # Start simple, maybe add PropertySerializer later if needed
    
    client_name = serializers.SerializerMethodField()
    property_address = serializers.SerializerMethodField()

    class Meta:
        model = Deal
        fields = [
            'id', 'user', 'title', 
            'contact_id', 'contact_details', 'client_name',
            'property_id', 'property_address',
            'stage', 'value', 'probability', 'closing_date', 'created_at'
        ]
        read_only_fields = ['user', 'created_at']

    def get_property_address(self, obj):
        return obj.property.address if obj.property else "Unknown Property"

    def get_client_name(self, obj):
        return f"{obj.contact.first_name} {obj.contact.last_name}" if obj.contact else "Unknown"
