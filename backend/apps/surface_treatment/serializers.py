"""
Serializers for Surface Treatment app.
"""

from rest_framework import serializers
from .models import TreatmentType, OrderSurfaceTreatment


class TreatmentTypeSerializer(serializers.ModelSerializer):
    """Serializer for TreatmentType model."""

    class Meta:
        model = TreatmentType
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class OrderSurfaceTreatmentSerializer(serializers.ModelSerializer):
    """Serializer for OrderSurfaceTreatment model."""

    order_quote_number = serializers.CharField(source='order.quote_number', read_only=True)
    treatment_type_name = serializers.CharField(source='treatment_type.name', read_only=True)
    treatment_type_code = serializers.CharField(source='treatment_type.code', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    completion_percentage = serializers.FloatField(read_only=True)
    pass_percentage = serializers.FloatField(read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = OrderSurfaceTreatment
        fields = '__all__'
        read_only_fields = [
            'id', 'started_at', 'completed_at', 'created_by',
            'updated_by', 'created_at', 'updated_at'
        ]


class OrderSurfaceTreatmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating order surface treatments."""

    class Meta:
        model = OrderSurfaceTreatment
        fields = [
            'order', 'treatment_type', 'planned_quantity', 'color',
            'thickness_microns', 'is_outsourced', 'vendor_name', 'remarks'
        ]

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class OrderSurfaceTreatmentUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating order surface treatments."""

    class Meta:
        model = OrderSurfaceTreatment
        fields = [
            'status', 'completed_quantity', 'rejected_quantity',
            'color', 'thickness_microns', 'is_outsourced',
            'vendor_name', 'vendor_batch_number', 'remarks'
        ]