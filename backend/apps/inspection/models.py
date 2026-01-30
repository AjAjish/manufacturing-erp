"""
Models for Inspection app - Quality inspection and QA approval.
"""

import uuid
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class InspectionType(models.Model):
    """Types of inspections."""

    class Stage(models.TextChoices):
        INCOMING = 'incoming', _('Incoming Inspection')
        IN_PROCESS = 'in_process', _('In-Process Inspection')
        FINAL = 'final', _('Final Inspection')
        PDI = 'pdi', _('Pre-Dispatch Inspection')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    stage = models.CharField(
        max_length=20,
        choices=Stage.choices,
        default=Stage.IN_PROCESS
    )
    description = models.TextField(blank=True, null=True)
    is_mandatory = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Inspection Type')
        verbose_name_plural = _('Inspection Types')
        ordering = ['stage', 'name']

    def __str__(self):
        return f"{self.code} - {self.name}"


class OrderInspection(models.Model):
    """Inspection records for orders."""

    class Result(models.TextChoices):
        PENDING = 'pending', _('Pending')
        PASS = 'pass', _('Pass')
        FAIL = 'fail', _('Fail')
        CONDITIONAL = 'conditional', _('Conditional Pass')
        REWORK = 'rework', _('Rework Required')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(
        'crm.Order',
        on_delete=models.CASCADE,
        related_name='inspections'
    )
    inspection_type = models.ForeignKey(
        InspectionType,
        on_delete=models.PROTECT,
        related_name='order_inspections'
    )
    
    # Quantities
    inspected_quantity = models.PositiveIntegerField(default=0)
    passed_quantity = models.PositiveIntegerField(default=0)
    failed_quantity = models.PositiveIntegerField(default=0)
    rework_quantity = models.PositiveIntegerField(default=0)
    
    # Result
    result = models.CharField(
        max_length=20,
        choices=Result.choices,
        default=Result.PENDING
    )
    
    # Timing
    inspection_date = models.DateField(blank=True, null=True)
    inspected_at = models.DateTimeField(blank=True, null=True)
    
    # QA Approval
    is_qa_approved = models.BooleanField(default=False)
    qa_approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='qa_approved_inspections'
    )
    qa_approved_at = models.DateTimeField(blank=True, null=True)
    
    # Notes
    qa_remarks = models.TextField(blank=True, null=True)
    defects_found = models.TextField(blank=True, null=True)
    corrective_action = models.TextField(blank=True, null=True)
    
    # Metadata
    inspected_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='performed_inspections'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Order Inspection')
        verbose_name_plural = _('Order Inspections')
        ordering = ['-inspection_date', '-created_at']

    def __str__(self):
        return f"{self.order.quote_number} - {self.inspection_type.name}"

    @property
    def pass_rate(self):
        if self.inspected_quantity > 0:
            return round((self.passed_quantity / self.inspected_quantity) * 100, 2)
        return 0

    @property
    def can_dispatch(self):
        """Check if order can be dispatched based on inspection."""
        if self.inspection_type.stage == InspectionType.Stage.PDI:
            return self.is_qa_approved and self.result == self.Result.PASS
        return True


class InspectionChecklist(models.Model):
    """Checklist items for inspections."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    inspection = models.ForeignKey(
        OrderInspection,
        on_delete=models.CASCADE,
        related_name='checklist_items'
    )
    parameter = models.CharField(max_length=255)
    specification = models.CharField(max_length=255, blank=True, null=True)
    actual_value = models.CharField(max_length=255, blank=True, null=True)
    is_passed = models.BooleanField(default=False)
    remarks = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Inspection Checklist Item')
        verbose_name_plural = _('Inspection Checklist Items')
        ordering = ['created_at']

    def __str__(self):
        return f"{self.inspection} - {self.parameter}"