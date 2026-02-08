from rest_framework import serializers
from .models import TransactionType, TransactionStatus, DateDefinition

class TransactionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionType
        fields = ['id', 'name', 'created_at']
        read_only_fields = ['id', 'created_at']

class TransactionStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionStatus
        fields = ['id', 'name', 'step_order']
        read_only_fields = ['id']

class DateDefinitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DateDefinition
        fields = ['id', 'name', 'is_milestone']
        read_only_fields = ['id']
