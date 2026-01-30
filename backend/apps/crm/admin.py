"""
Admin configuration for CRM app.
"""

from django.contrib import admin
from .models import Customer, Order, OrderStatusHistory


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['company_name', 'name', 'customer_type', 'email', 'phone', 'city', 'is_active']
    list_filter = ['customer_type', 'is_active', 'city', 'state', 'country']
    search_fields = ['name', 'company_name', 'email', 'phone', 'gst_number']
    ordering = ['-created_at']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        'quote_number', 'customer', 'project_name', 'status',
        'priority', 'expected_delivery_date', 'created_at'
    ]
    list_filter = ['status', 'priority', 'created_at']
    search_fields = ['quote_number', 'po_number', 'work_order_number', 'project_name']
    ordering = ['-created_at']
    raw_id_fields = ['customer', 'created_by', 'assigned_to']


@admin.register(OrderStatusHistory)
class OrderStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ['order', 'previous_status', 'new_status', 'changed_by', 'created_at']
    list_filter = ['new_status', 'created_at']
    ordering = ['-created_at']
    raw_id_fields = ['order', 'changed_by']