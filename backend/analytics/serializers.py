from rest_framework import serializers

class DashboardStatsSerializer(serializers.Serializer):
    total_active_deals = serializers.IntegerField()
    total_closed_volume = serializers.DecimalField(max_digits=15, decimal_places=2)
    deals_by_status = serializers.ListField(
        child=serializers.DictField()
    )
    recent_transactions = serializers.ListField(
        child=serializers.DictField()
    )
