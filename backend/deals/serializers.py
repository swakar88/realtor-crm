from rest_framework import serializers
from .models import Deal
from transactions.serializers import ContactSerializer
from transactions.models import Contact

class DealSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    contact_id = serializers.PrimaryKeyRelatedField(
        queryset=Contact.objects.all(), source='contact', write_only=True
    )
    contact_details = ContactSerializer(source='contact', read_only=True)
    client_name = serializers.SerializerMethodField()

    class Meta:
        model = Deal
        fields = ['id', 'user', 'title', 'contact_id', 'contact_details', 'client_name', 'stage', 'value', 'probability', 'closing_date', 'created_at']
        read_only_fields = ['user', 'created_at']

    def get_client_name(self, obj):
        return f"{obj.contact.first_name} {obj.contact.last_name}" if obj.contact else "Unknown"
