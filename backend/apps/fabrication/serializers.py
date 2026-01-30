"""
Serializers for Fabrication app.
"""

from rest_framework import serializers
from .models import FabricationProcess, OrderFabrication, FabricationLog


class FabricationProcessSerializer(serializers.ModelSerializer):
    """Serializer for FabricationProcess model."""

    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = FabricationProcess
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class FabricationLogSerializer(serializers.ModelSerializer):
    """Serializer for FabricationLog model."""

    logged_by_name = serializers.CharField(source='logged_by.get_full_name', read_only=True)
    previous_status_display = serializers.CharField(source='get_previous_status_display', read_only=True)
    new_status_display = serializers.CharField(source='get_new_status_display', read_only=True)

    class Meta:
        model = FabricationLog
        fields = '__all__'
        read_only_fields = ['id', 'logged_by', 'created_at']


class OrderFabricationSerializer(serializers.ModelSerializer):
    """Serializer for OrderFabrication model."""

    order_quote_number = serializers.CharField(source='order.quote_number', read_only=True)
    process_name = serializers.CharField(source='process.name', read_only=True)
    process_code = serializers.CharField(source='process.code', read_only=True)
    process_category = serializers.CharField(source='process.get_category_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    completion_percentage = serializers.FloatField(read_only=True)
    is_delayed = serializers.BooleanField(read_only=True)
    operator_name = serializers.CharField(source='operator.get_full_name', read_only=True)
    logs = FabricationLogSerializer(many=True, read_only=True)

    class Meta:
        model = OrderFabrication
        fields = '__all__'
        read_only_fields = [
            'id', 'started_at', 'completed_at', 'created_by',
            'updated_by', 'created_at', 'updated_at'
        ]


class OrderFabricationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating order fabrications."""

    class Meta:
        model = OrderFabrication
        fields = [
            'order', 'process', 'planned_quantity',
            'planned_start_date', 'planned_end_date', 'machine', 'remarks'
        ]

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class OrderFabricationUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating order fabrications."""

    class Meta:
        model = OrderFabrication
        fields = [
            'status', 'completed_quantity', 'actual_start_date',
            'actual_end_date', 'machine', 'operator', 'remarks'
        ]


class BulkFabricationCreateSerializer(serializers.Serializer):
    """Serializer for bulk creating fabrication processes for an order."""

    order_id = serializers.UUIDField()
    process_ids = serializers.ListField(
        child=serializers.UUIDField(),
        min_length=1
    )
    planned_quantity = serializers.IntegerField(min_value=1)