"""
Admin configuration for Materials app.
"""

from django.contrib import admin
from .models import MaterialType, Material, OrderMaterial, MaterialTransaction


@admin.register(MaterialType)
class MaterialTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name', 'description']


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = [
        'code', 'name', 'material_type', 'grade', 'unit',
        'stock_quantity', 'minimum_stock', 'is_active'
    ]
    list_filter = ['material_type', 'unit', 'is_active']
    search_fields = ['code', 'name', 'grade']
    ordering = ['code']


@admin.register(OrderMaterial)
class OrderMaterialAdmin(admin.ModelAdmin):
    list_display = [
        'order', 'material', 'required_quantity', 'issued_quantity',
        'status', 'created_at'
    ]
    list_filter = ['status', 'created_at']
    search_fields = ['order__quote_number', 'material__code']
    raw_id_fields = ['order', 'material', 'created_by', 'issued_by']


@admin.register(MaterialTransaction)
class MaterialTransactionAdmin(admin.ModelAdmin):
    list_display = [
        'material', 'transaction_type', 'quantity',
        'stock_before', 'stock_after', 'created_at'
    ]
    list_filter = ['transaction_type', 'created_at']
    search_fields = ['material__code', 'reference_number']
    raw_id_fields = ['material', 'order', 'created_by']