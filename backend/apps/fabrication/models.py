"""
Models for Fabrication app - Process tracking per order.
"""

import uuid
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class FabricationProcess(models.Model):
    """Master list of fabrication processes."""

    class ProcessCategory(models.TextChoices):
        CUTTING = 'cutting', _('Cutting')
        FORMING = 'forming', _('Forming')
        JOINING = 'joining', _('Joining')
        FINISHING = 'finishing', _('Finishing')
        ASSEMBLY = 'assembly', _('Assembly')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    category = models.CharField(
        max_length=20,
        choices=ProcessCategory.choices,
        default=ProcessCategory.CUTTING
    )
    description = models.TextField(blank=True, null=True)
    sequence_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Fabrication Process')
        verbose_name_plural = _('Fabrication Processes')
        ordering = ['sequence_order', 'name']

    def __str__(self):
        return f"{self.code} - {self.name}"


class OrderFabrication(models.Model):
    """Fabrication process tracking for each order."""

    class Status(models.TextChoices):
        NOT_STARTED = 'not_started', _('Not Started')
        PENDING = 'pending', _('Pending')
        IN_PROGRESS = 'in_progress', _('In Progress')
        COMPLETED = 'completed', _('Completed')
        ON_HOLD = 'on_hold', _('On Hold')
        SKIPPED = 'skipped', _('Skipped')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(
        'crm.Order',
        on_delete=models.CASCADE,
        related_name='fabrication_processes'
    )
    process = models.ForeignKey(
        FabricationProcess,
        on_delete=models.PROTECT,
        related_name='order_fabrications'
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.NOT_STARTED
    )
    
    # Quantities
    planned_quantity = models.PositiveIntegerField(default=0)
    completed_quantity = models.PositiveIntegerField(default=0)
    
    # Timing
    planned_start_date = models.DateField(blank=True, null=True)
    planned_end_date = models.DateField(blank=True, null=True)
    actual_start_date = models.DateField(blank=True, null=True)
    actual_end_date = models.DateField(blank=True, null=True)
    started_at = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    
    # Machine/Resource
    machine = models.CharField(max_length=100, blank=True, null=True)
    operator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='operated_fabrications'
    )
    
    # Notes
    remarks = models.TextField(blank=True, null=True)
    
    # Metadata
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_fabrications'
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='updated_fabrications'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Order Fabrication')
        verbose_name_plural = _('Order Fabrications')
        ordering = ['process__sequence_order']
        unique_together = ['order', 'process']

    def __str__(self):
        return f"{self.order.quote_number} - {self.process.name}"

    @property
    def completion_percentage(self):
        if self.planned_quantity > 0:
            return round((self.completed_quantity / self.planned_quantity) * 100, 2)
        return 0

    @property
    def is_delayed(self):
        from django.utils import timezone
        if self.planned_end_date and self.status not in [self.Status.COMPLETED, self.Status.SKIPPED]:
            return timezone.now().date() > self.planned_end_date
        return False


class FabricationLog(models.Model):
    """Log entries for fabrication process updates."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_fabrication = models.ForeignKey(
        OrderFabrication,
        on_delete=models.CASCADE,
        related_name='logs'
    )
    previous_status = models.CharField(
        max_length=20,
        choices=OrderFabrication.Status.choices,
        blank=True,
        null=True
    )
    new_status = models.CharField(
        max_length=20,
        choices=OrderFabrication.Status.choices
    )
    quantity_completed = models.PositiveIntegerField(default=0)
    notes = models.TextField(blank=True, null=True)
    logged_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Fabrication Log')
        verbose_name_plural = _('Fabrication Logs')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.order_fabrication} - {self.new_status}"