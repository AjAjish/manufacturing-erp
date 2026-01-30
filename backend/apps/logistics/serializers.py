"""
Serializers for Logistics app.
"""

from rest_framework import serializers
from .models import PackingStandard, OrderDispatch, DispatchDocument


class PackingStandardSerializer(serializers.ModelSerializer):
    """Serializer for PackingStandard model."""

    class Meta:
        model = PackingStandard
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class DispatchDocumentSerializer(serializers.ModelSerializer):
    """Serializer for DispatchDocument model."""

    document_type_display = serializers.CharField(source='get_document_type_display', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = DispatchDocument
        fields = '__all__'
        read_only_fields = ['id', 'uploaded_by', 'created_at']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None


class OrderDispatchSerializer(serializers.ModelSerializer):
    """Serializer for OrderDispatch model."""

    order_quote_number = serializers.CharField(source='order.quote_number', read_only=True)
    order_project_name = serializers.CharField(source='order.project_name', read_only=True)
    customer_name = serializers.CharField(source='order.customer.company_name', read_only=True)
    packing_standard_name = serializers.CharField(source='packing_standard.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    transport_mode_display = serializers.CharField(source='get_transport_mode_display', read_only=True)
    transport_scope_display = serializers.CharField(source='get_transport_scope_display', read_only=True)
    can_dispatch = serializers.BooleanField(read_only=True)
    is_delayed = serializers.BooleanField(read_only=True)
    packed_by_name = serializers.CharField(source='packed_by.get_full_name', read_only=True)
    dispatched_by_name = serializers.CharField(source='dispatched_by.get_full_name', read_only=True)
    documents = DispatchDocumentSerializer(many=True, read_only=True)

    class Meta:
        model = OrderDispatch
        fields = '__all__'
        read_only_fields = [
            'id', 'dispatched_at', 'delivered_at', 'packed_by',
            'dispatched_by', 'created_by', 'created_at', 'updated_at'
        ]


class OrderDispatchCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating order dispatches."""

    class Meta:
        model = OrderDispatch
        fields = [
            'order', 'packing_standard', 'planned_dispatch_date',
            'transport_mode', 'transport_scope', 'delivery_address',
            'delivery_contact_name', 'delivery_contact_phone',
            'special_instructions', 'remarks'
        ]

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class OrderDispatchUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating order dispatches."""

    class Meta:
        model = OrderDispatch
        fields = [
            'packing_standard', 'packing_details', 'total_packages',
            'gross_weight', 'net_weight', 'dimensions', 'status',
            'transport_mode', 'transport_scope', 'transporter_name',
            'vehicle_number', 'driver_name', 'driver_phone',
            'tracking_number', 'invoice_number', 'e_way_bill_number',
            'lr_number', 'planned_dispatch_date', 'expected_delivery_date',
            'delivery_address', 'delivery_contact_name', 'delivery_contact_phone',
            'remarks', 'special_instructions'
        ]


class DispatchActionSerializer(serializers.Serializer):
    """Serializer for dispatch actions."""

    remarks = serializers.CharField(required=False, allow_blank=True)