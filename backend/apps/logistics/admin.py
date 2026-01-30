"""
Admin configuration for Logistics app.
"""

from django.contrib import admin
from .models import PackingStandard, OrderDispatch, DispatchDocument


@admin.register(PackingStandard)
class PackingStandardAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['code', 'name']


@admin.register(OrderDispatch)
class OrderDispatchAdmin(admin.ModelAdmin):
    list_display = [
        'order', 'status', 'transport_mode', 'planned_dispatch_date',
        'actual_dispatch_date', 'transporter_name'
    ]
    list_filter = ['status', 'transport_mode', 'transport_scope']
    search_fields = ['order__quote_number', 'transporter_name', 'tracking_number']
    raw_id_fields = ['order', 'packing_standard', 'packed_by', 'dispatched_by', 'created_by']


@admin.register(DispatchDocument)
class DispatchDocumentAdmin(admin.ModelAdmin):
    list_display = ['dispatch', 'document_type', 'document_number', 'uploaded_by', 'created_at']
    list_filter = ['document_type']
    search_fields = ['dispatch__order__quote_number', 'document_number']
    raw_id_fields = ['dispatch', 'uploaded_by']