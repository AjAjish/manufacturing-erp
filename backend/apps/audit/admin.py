"""
Admin configuration for Audit app.
"""

from django.contrib import admin
from .models import AuditLog, UserActivity


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['user_email', 'action', 'model_name', 'object_repr', 'created_at']
    list_filter = ['action', 'model_name', 'created_at']
    search_fields = ['user_email', 'object_repr', 'notes']
    ordering = ['-created_at']
    readonly_fields = [
        'id', 'user', 'user_email', 'action', 'content_type', 'object_id',
        'model_name', 'object_repr', 'old_values', 'new_values', 'changes',
        'ip_address', 'user_agent', 'created_at'
    ]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(UserActivity)
class UserActivityAdmin(admin.ModelAdmin):
    list_display = ['user', 'activity_type', 'ip_address', 'created_at']
    list_filter = ['activity_type', 'created_at']
    search_fields = ['user__email', 'description']
    ordering = ['-created_at']