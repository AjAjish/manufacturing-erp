"""
Serializers for Production app.
"""

from rest_framework import serializers
from .models import ProductionRecord, ProductionSummary


class ProductionRecordSerializer(serializers.ModelSerializer):
    """Serializer for ProductionRecord model."""

    order_quote_number = serializers.CharField(source='order.quote_number', read_only=True)
    order_project_name = serializers.CharField(source='order.project_name', read_only=True)
    shift_display = serializers.CharField(source='get_shift_display', read_only=True)
    recorded_by_name = serializers.CharField(source='recorded_by.get_full_name', read_only=True)
    verified_by_name = serializers.CharField(source='verified_by.get_full_name', read_only=True)

    class Meta:
        model = ProductionRecord
        fields = '__all__'
        read_only_fields = [
            'id', 'produced_quantity', 'ok_percentage', 'rework_percentage',
            'rejection_percentage', 'total_yield_percentage', 'recorded_by',
            'verified_by', 'verified_at', 'created_at', 'updated_at'
        ]


class ProductionRecordCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating production records."""

    class Meta:
        model = ProductionRecord
        fields = [
            'order', 'production_date', 'shift', 'planned_quantity',
            'ok_quantity', 'rework_quantity', 'rejection_quantity',
            'remarks', 'rejection_reasons'
        ]

    def create(self, validated_data):
        validated_data['recorded_by'] = self.context['request'].user
        return super().create(validated_data)


class ProductionRecordUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating production records."""

    class Meta:
        model = ProductionRecord
        fields = [
            'planned_quantity', 'ok_quantity', 'rework_quantity',
            'rejection_quantity', 'remarks', 'rejection_reasons'
        ]


class ProductionSummarySerializer(serializers.ModelSerializer):
    """Serializer for ProductionSummary model."""

    order_quote_number = serializers.CharField(source='order.quote_number', read_only=True)
    order_project_name = serializers.CharField(source='order.project_name', read_only=True)
    ordered_quantity = serializers.IntegerField(source='order.ordered_quantity', read_only=True)

    class Meta:
        model = ProductionSummary
        fields = '__all__'
        read_only_fields = ['id', 'order', 'last_updated']