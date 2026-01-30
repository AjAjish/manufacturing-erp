"""
Serializers for Audit app.
"""

from rest_framework import serializers
from .models import AuditLog, UserActivity


class AuditLogSerializer(serializers.ModelSerializer):
    """Serializer for AuditLog model."""

    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)

    class Meta:
        model = AuditLog
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class UserActivitySerializer(serializers.ModelSerializer):
    """Serializer for UserActivity model."""

    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = UserActivity
        fields = '__all__'
        read_only_fields = ['id', 'created_at']