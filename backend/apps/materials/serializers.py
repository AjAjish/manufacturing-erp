"""
Serializers for Materials app.
"""

from rest_framework import serializers
from decimal import Decimal
from .models import MaterialType, Material, OrderMaterial, MaterialTransaction


class MaterialTypeSerializer(serializers.ModelSerializer):
    """Serializer for MaterialType model."""

    material_count = serializers.SerializerMethodField()

    class Meta:
        model = MaterialType
        fields = ['id', 'name', 'description', 'is_active', 'material_count', 'created_at']

    def get_material_count(self, obj):
        return obj.materials.count()


class MaterialListSerializer(serializers.ModelSerializer):
    """Serializer for material list view."""

    material_type_name = serializers.CharField(source='material_type.name', read_only=True)
    unit_display = serializers.CharField(source='get_unit_display', read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    dimensions = serializers.CharField(read_only=True)

    class Meta:
        model = Material
        fields = [
            'id', 'code', 'name', 'material_type', 'material_type_name',
            'grade', 'thickness', 'dimensions', 'unit', 'unit_display',
            'unit_price', 'stock_quantity', 'minimum_stock', 'is_low_stock',
            'is_active'
        ]


class MaterialDetailSerializer(serializers.ModelSerializer):
    """Serializer for material detail view."""

    material_type_name = serializers.CharField(source='material_type.name', read_only=True)
    unit_display = serializers.CharField(source='get_unit_display', read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    dimensions = serializers.CharField(read_only=True)

    class Meta:
        model = Material
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class MaterialCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating materials."""

    class Meta:
        model = Material
        exclude = ['created_at', 'updated_at']


class OrderMaterialSerializer(serializers.ModelSerializer):
    """Serializer for OrderMaterial model."""

    material_code = serializers.CharField(source='material.code', read_only=True)
    material_name = serializers.CharField(source='material.name', read_only=True)
    material_unit = serializers.CharField(source='material.get_unit_display', read_only=True)
    order_quote_number = serializers.CharField(source='order.quote_number', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    pending_quantity = serializers.DecimalField(max_digits=12, decimal_places=3, read_only=True)
    utilization_percentage = serializers.FloatField(read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    issued_by_name = serializers.CharField(source='issued_by.get_full_name', read_only=True)

    class Meta:
        model = OrderMaterial
        fields = '__all__'
        read_only_fields = [
            'id', 'issued_quantity', 'consumed_quantity', 'returned_quantity',
            'status', 'created_by', 'issued_by', 'issued_at', 'created_at', 'updated_at'
        ]


class OrderMaterialCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating order materials."""

    class Meta:
        model = OrderMaterial
        fields = ['order', 'material', 'required_quantity', 'notes']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class MaterialIssueSerializer(serializers.Serializer):
    """Serializer for issuing materials."""

    quantity = serializers.DecimalField(
        max_digits=12,
        decimal_places=3,
        min_value=Decimal('0.001')
    )
    notes = serializers.CharField(required=False, allow_blank=True)


class MaterialTransactionSerializer(serializers.ModelSerializer):
    """Serializer for MaterialTransaction model."""

    material_code = serializers.CharField(source='material.code', read_only=True)
    material_name = serializers.CharField(source='material.name', read_only=True)
    transaction_type_display = serializers.CharField(source='get_transaction_type_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = MaterialTransaction
        fields = '__all__'
        read_only_fields = ['id', 'stock_before', 'stock_after', 'created_by', 'created_at']


class StockAdjustmentSerializer(serializers.Serializer):
    """Serializer for stock adjustments."""

    quantity = serializers.DecimalField(max_digits=12, decimal_places=3)
    transaction_type = serializers.ChoiceField(
        choices=[
            ('receipt', 'Receipt'),
            ('adjustment', 'Adjustment'),
            ('scrap', 'Scrap')
        ]
    )
    reference_number = serializers.CharField(required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)