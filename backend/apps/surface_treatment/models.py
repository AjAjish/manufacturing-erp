"""
Models for Surface Treatment app - Coating processes tracking.
"""

import uuid
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class TreatmentType(models.Model):
    """Types of surface treatments available."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Treatment Type')
        verbose_name_plural = _('Treatment Types')
        ordering = ['name']

    def __str__(self):
        return f"{self.code} - {self.name}"


class OrderSurfaceTreatment(models.Model):
    """Surface treatment tracking for orders."""

    class Status(models.TextChoices):
        NOT_REQUIRED = 'not_required', _('Not Required')
        PENDING = 'pending', _('Pending')
        IN_PROGRESS = 'in_progress', _('In Progress')
        COMPLETED = 'completed', _('Completed')
        FAILED = 'failed', _('Failed')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(
        'crm.Order',
        on_delete=models.CASCADE,
        related_name='surface_treatments'
    )
    treatment_type = models.ForeignKey(
        TreatmentType,
        on_delete=models.PROTECT,
        related_name='order_treatments'
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    
    # Quantities
    planned_quantity = models.PositiveIntegerField(default=0)
    completed_quantity = models.PositiveIntegerField(default=0)
    rejected_quantity = models.PositiveIntegerField(default=0)
    
    # Specifications
    color = models.CharField(max_length=100, blank=True, null=True)
    thickness_microns = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        blank=True,
        null=True,
        help_text=_('Coating thickness in microns')
    )
    
    # Timing
    started_at = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    
    # Vendor (if outsourced)
    is_outsourced = models.BooleanField(default=False)
    vendor_name = models.CharField(max_length=255, blank=True, null=True)
    vendor_batch_number = models.CharField(max_length=100, blank=True, null=True)
    
    # Notes
    remarks = models.TextField(blank=True, null=True)
    
    # Metadata
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_surface_treatments'
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='updated_surface_treatments'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Order Surface Treatment')
        verbose_name_plural = _('Order Surface Treatments')
        ordering = ['-created_at']
        unique_together = ['order', 'treatment_type']

    def __str__(self):
        return f"{self.order.quote_number} - {self.treatment_type.name}"

    @property
    def completion_percentage(self):
        if self.planned_quantity > 0:
            return round((self.completed_quantity / self.planned_quantity) * 100, 2)
        return 0

    @property
    def pass_percentage(self):
        total = self.completed_quantity + self.rejected_quantity
        if total > 0:
            return round((self.completed_quantity / total) * 100, 2)
        return 0