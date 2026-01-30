"""
Admin configuration for Surface Treatment app.
"""

from django.contrib import admin
from .models import TreatmentType, OrderSurfaceTreatment


@admin.register(TreatmentType)
class TreatmentTypeAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['code', 'name']


@admin.register(OrderSurfaceTreatment)
class OrderSurfaceTreatmentAdmin(admin.ModelAdmin):
    list_display = [
        'order', 'treatment_type', 'status', 'planned_quantity',
        'completed_quantity', 'is_outsourced'
    ]
    list_filter = ['status', 'treatment_type', 'is_outsourced']
    search_fields = ['order__quote_number', 'vendor_name']
    raw_id_fields = ['order', 'treatment_type', 'created_by', 'updated_by']