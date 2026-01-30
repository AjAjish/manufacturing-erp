"""
Admin configuration for Inspection app.
"""

from django.contrib import admin
from .models import InspectionType, OrderInspection, InspectionChecklist


@admin.register(InspectionType)
class InspectionTypeAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'stage', 'is_mandatory', 'is_active']
    list_filter = ['stage', 'is_mandatory', 'is_active']
    search_fields = ['code', 'name']


@admin.register(OrderInspection)
class OrderInspectionAdmin(admin.ModelAdmin):
    list_display = [
        'order', 'inspection_type', 'result', 'inspected_quantity',
        'passed_quantity', 'is_qa_approved', 'inspection_date'
    ]
    list_filter = ['result', 'is_qa_approved', 'inspection_type']
    search_fields = ['order__quote_number']
    raw_id_fields = ['order', 'inspection_type', 'inspected_by', 'qa_approved_by']


@admin.register(InspectionChecklist)
class InspectionChecklistAdmin(admin.ModelAdmin):
    list_display = ['inspection', 'parameter', 'specification', 'actual_value', 'is_passed']
    list_filter = ['is_passed']
    search_fields = ['parameter', 'inspection__order__quote_number']
    raw_id_fields = ['inspection']