"""
Admin configuration for Production app.
"""

from django.contrib import admin
from .models import ProductionRecord, ProductionSummary


@admin.register(ProductionRecord)
class ProductionRecordAdmin(admin.ModelAdmin):
    list_display = [
        'order', 'production_date', 'shift', 'produced_quantity',
        'ok_quantity', 'rework_quantity', 'rejection_quantity',
        'total_yield_percentage'
    ]
    list_filter = ['production_date', 'shift']
    search_fields = ['order__quote_number']
    ordering = ['-production_date']
    raw_id_fields = ['order', 'recorded_by', 'verified_by']


@admin.register(ProductionSummary)
class ProductionSummaryAdmin(admin.ModelAdmin):
    list_display = [
        'order', 'total_produced', 'total_ok', 'total_rejection',
        'overall_yield_percentage', 'completion_percentage'
    ]
    search_fields = ['order__quote_number']
    raw_id_fields = ['order']