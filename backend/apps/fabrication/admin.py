"""
Admin configuration for Fabrication app.
"""

from django.contrib import admin
from .models import FabricationProcess, OrderFabrication, FabricationLog


@admin.register(FabricationProcess)
class FabricationProcessAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'category', 'sequence_order', 'is_active']
    list_filter = ['category', 'is_active']
    search_fields = ['code', 'name']
    ordering = ['sequence_order']


@admin.register(OrderFabrication)
class OrderFabricationAdmin(admin.ModelAdmin):
    list_display = [
        'order', 'process', 'status', 'planned_quantity',
        'completed_quantity', 'planned_end_date'
    ]
    list_filter = ['status', 'process']
    search_fields = ['order__quote_number', 'process__name']
    raw_id_fields = ['order', 'process', 'operator', 'created_by', 'updated_by']


@admin.register(FabricationLog)
class FabricationLogAdmin(admin.ModelAdmin):
    list_display = ['order_fabrication', 'previous_status', 'new_status', 'logged_by', 'created_at']
    list_filter = ['new_status', 'created_at']
    raw_id_fields = ['order_fabrication', 'logged_by']