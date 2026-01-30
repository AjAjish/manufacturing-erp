"""
Admin configuration for Engineering app.
"""

from django.contrib import admin
from .models import Drawing, DrawingComment


@admin.register(Drawing)
class DrawingAdmin(admin.ModelAdmin):
    list_display = [
        'drawing_number', 'title', 'order', 'drawing_type',
        'version', 'revision', 'status', 'is_latest', 'created_at'
    ]
    list_filter = ['drawing_type', 'status', 'is_latest', 'created_at']
    search_fields = ['drawing_number', 'title', 'order__quote_number']
    ordering = ['-created_at']
    raw_id_fields = ['order', 'created_by', 'approved_by', 'parent_drawing']


@admin.register(DrawingComment)
class DrawingCommentAdmin(admin.ModelAdmin):
    list_display = ['drawing', 'user', 'comment', 'created_at']
    list_filter = ['created_at']
    search_fields = ['comment', 'drawing__drawing_number']
    raw_id_fields = ['drawing', 'user']