"""
Serializers for CRM app.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Customer, Order, OrderStatusHistory

User = get_user_model()


class CustomerListSerializer(serializers.ModelSerializer):
    """Serializer for customer list view."""

    total_orders = serializers.IntegerField(read_only=True)
    active_orders = serializers.IntegerField(read_only=True)
    customer_type_display = serializers.CharField(source='get_customer_type_display', read_only=True)

    class Meta:
        model = Customer
        fields = [
            'id', 'name', 'company_name', 'customer_type', 'customer_type_display',
            'email', 'phone', 'city', 'is_active', 'total_orders', 'active_orders',
            'created_at'
        ]


class CustomerDetailSerializer(serializers.ModelSerializer):
    """Serializer for customer detail view."""

    total_orders = serializers.IntegerField(read_only=True)
    active_orders = serializers.IntegerField(read_only=True)
    customer_type_display = serializers.CharField(source='get_customer_type_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = Customer
        fields = '__all__'
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class CustomerCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating customers."""

    class Meta:
        model = Customer
        exclude = ['created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    """Serializer for order status history."""

    changed_by_name = serializers.CharField(source='changed_by.get_full_name', read_only=True)
    previous_status_display = serializers.CharField(source='get_previous_status_display', read_only=True)
    new_status_display = serializers.CharField(source='get_new_status_display', read_only=True)

    class Meta:
        model = OrderStatusHistory
        fields = [
            'id', 'previous_status', 'previous_status_display',
            'new_status', 'new_status_display', 'changed_by',
            'changed_by_name', 'notes', 'created_at'
        ]


class OrderListSerializer(serializers.ModelSerializer):
    """Serializer for order list view."""

    customer_name = serializers.CharField(source='customer.company_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    is_delayed = serializers.BooleanField(read_only=True)
    days_remaining = serializers.IntegerField(read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'quote_number', 'po_number', 'work_order_number',
            'customer', 'customer_name', 'project_name', 'ordered_quantity',
            'status', 'status_display', 'status_percentage', 'priority',
            'priority_display', 'expected_delivery_date', 'is_delayed',
            'days_remaining', 'total_amount', 'created_at'
        ]


class OrderDetailSerializer(serializers.ModelSerializer):
    """Serializer for order detail view."""

    customer_name = serializers.CharField(source='customer.company_name', read_only=True)
    customer_details = CustomerListSerializer(source='customer', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    is_delayed = serializers.BooleanField(read_only=True)
    days_remaining = serializers.IntegerField(read_only=True)
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at', 'total_amount']


class OrderCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating orders."""

    class Meta:
        model = Order
        fields = [
            'quote_number', 'po_number', 'work_order_number', 'customer',
            'project_name', 'description', 'ordered_quantity', 'planned_lead_time',
            'expected_delivery_date', 'priority', 'unit_price', 'remarks',
            'internal_notes', 'assigned_to'
        ]

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        validated_data['status'] = Order.Status.DRAFT
        return super().create(validated_data)


class OrderUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating orders."""

    class Meta:
        model = Order
        fields = [
            'po_number', 'work_order_number', 'invoice_number', 'grn_number',
            'project_name', 'description', 'ordered_quantity', 'planned_lead_time',
            'actual_lead_time', 'expected_delivery_date', 'actual_delivery_date',
            'status', 'status_percentage', 'priority', 'unit_price', 'remarks',
            'internal_notes', 'assigned_to'
        ]


class OrderStatusUpdateSerializer(serializers.Serializer):
    """Serializer for updating order status."""

    status = serializers.ChoiceField(choices=Order.Status.choices)
    notes = serializers.CharField(required=False, allow_blank=True)