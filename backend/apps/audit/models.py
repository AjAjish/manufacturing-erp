"""
Models for Audit app - Activity tracking and audit trail.
"""

import uuid
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType


class AuditLog(models.Model):
    """Audit log for tracking all changes in the system."""

    class Action(models.TextChoices):
        CREATE = 'create', _('Create')
        UPDATE = 'update', _('Update')
        DELETE = 'delete', _('Delete')
        VIEW = 'view', _('View')
        LOGIN = 'login', _('Login')
        LOGOUT = 'logout', _('Logout')
        EXPORT = 'export', _('Export')
        IMPORT = 'import', _('Import')
        APPROVE = 'approve', _('Approve')
        REJECT = 'reject', _('Reject')
        STATUS_CHANGE = 'status_change', _('Status Change')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # User who performed the action
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='audit_logs'
    )
    user_email = models.EmailField(blank=True, null=True)  # Store email in case user is deleted
    
    # Action details
    action = models.CharField(max_length=20, choices=Action.choices)
    
    # Affected model/object
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    object_id = models.CharField(max_length=100, blank=True, null=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # Model name for easier querying
    model_name = models.CharField(max_length=100, blank=True, null=True)
    object_repr = models.CharField(max_length=255, blank=True, null=True)
    
    # Changes
    old_values = models.JSONField(blank=True, null=True)
    new_values = models.JSONField(blank=True, null=True)
    changes = models.JSONField(blank=True, null=True)
    
    # Additional info
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    
    # Timestamp
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Audit Log')
        verbose_name_plural = _('Audit Logs')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['model_name', 'created_at']),
            models.Index(fields=['action', 'created_at']),
        ]

    def __str__(self):
        return f"{self.user_email or 'System'} - {self.action} - {self.model_name} - {self.created_at}"

    def save(self, *args, **kwargs):
        if self.user and not self.user_email:
            self.user_email = self.user.email
        super().save(*args, **kwargs)


class UserActivity(models.Model):
    """Track user activity and sessions."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='activities'
    )
    activity_type = models.CharField(max_length=50)
    description = models.TextField(blank=True, null=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('User Activity')
        verbose_name_plural = _('User Activities')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.activity_type} - {self.created_at}"