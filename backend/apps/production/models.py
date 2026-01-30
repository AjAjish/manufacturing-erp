"""
Models for Production app - Production quantity tracking.
"""

import uuid
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator
from decimal import Decimal


class ProductionRecord(models.Model):
    """
    Production record for tracking OK, Rework, and Rejection quantities.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(
        'crm.Order',
        on_delete=models.CASCADE,
        related_name='production_records'
    )
    
    # Production Date
    production_date = models.DateField()
    shift = models.CharField(
        max_length=20,
        choices=[
            ('day', 'Day Shift'),
            ('night', 'Night Shift'),
            ('general', 'General Shift'),
        ],
        default='general'
    )
    
    # Quantities
    planned_quantity = models.PositiveIntegerField(default=0)
    produced_quantity = models.PositiveIntegerField(default=0)
    ok_quantity = models.PositiveIntegerField(default=0)
    rework_quantity = models.PositiveIntegerField(default=0)
    rejection_quantity = models.PositiveIntegerField(default=0)
    
    # Calculated fields (stored for performance)
    ok_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00')
    )
    rework_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00')
    )
    rejection_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00')
    )
    total_yield_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00')
    )
    
    # Notes
    remarks = models.TextField(blank=True, null=True)
    rejection_reasons = models.TextField(blank=True, null=True)
    
    # Metadata
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='production_records'
    )
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_production_records'
    )
    verified_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Production Record')
        verbose_name_plural = _('Production Records')
        ordering = ['-production_date', '-created_at']
        unique_together = ['order', 'production_date', 'shift']

    def __str__(self):
        return f"{self.order.quote_number} - {self.production_date} ({self.shift})"

    def save(self, *args, **kwargs):
        # Calculate produced quantity
        self.produced_quantity = self.ok_quantity + self.rework_quantity + self.rejection_quantity
        
        # Calculate percentages
        if self.produced_quantity > 0:
            self.ok_percentage = Decimal(self.ok_quantity / self.produced_quantity * 100).quantize(Decimal('0.01'))
            self.rework_percentage = Decimal(self.rework_quantity / self.produced_quantity * 100).quantize(Decimal('0.01'))
            self.rejection_percentage = Decimal(self.rejection_quantity / self.produced_quantity * 100).quantize(Decimal('0.01'))
            self.total_yield_percentage = Decimal(
                (self.ok_quantity + self.rework_quantity) / self.produced_quantity * 100
            ).quantize(Decimal('0.01'))
        else:
            self.ok_percentage = Decimal('0.00')
            self.rework_percentage = Decimal('0.00')
            self.rejection_percentage = Decimal('0.00')
            self.total_yield_percentage = Decimal('0.00')
        
        super().save(*args, **kwargs)


class ProductionSummary(models.Model):
    """
    Aggregated production summary for an order.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.OneToOneField(
        'crm.Order',
        on_delete=models.CASCADE,
        related_name='production_summary'
    )
    
    # Total quantities
    total_planned = models.PositiveIntegerField(default=0)
    total_produced = models.PositiveIntegerField(default=0)
    total_ok = models.PositiveIntegerField(default=0)
    total_rework = models.PositiveIntegerField(default=0)
    total_rejection = models.PositiveIntegerField(default=0)
    
    # Overall percentages
    overall_ok_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00')
    )
    overall_rework_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00')
    )
    overall_rejection_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00')
    )
    overall_yield_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00')
    )
    
    # Completion
    completion_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00')
    )
    
    # Timestamps
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Production Summary')
        verbose_name_plural = _('Production Summaries')

    def __str__(self):
        return f"Summary: {self.order.quote_number}"

    def update_from_records(self):
        """Update summary from production records."""
        from django.db.models import Sum
        
        records = self.order.production_records.all()
        aggregates = records.aggregate(
            total_planned=Sum('planned_quantity'),
            total_produced=Sum('produced_quantity'),
            total_ok=Sum('ok_quantity'),
            total_rework=Sum('rework_quantity'),
            total_rejection=Sum('rejection_quantity')
        )
        
        self.total_planned = aggregates['total_planned'] or 0
        self.total_produced = aggregates['total_produced'] or 0
        self.total_ok = aggregates['total_ok'] or 0
        self.total_rework = aggregates['total_rework'] or 0
        self.total_rejection = aggregates['total_rejection'] or 0
        
        # Calculate percentages
        if self.total_produced > 0:
            self.overall_ok_percentage = Decimal(
                self.total_ok / self.total_produced * 100
            ).quantize(Decimal('0.01'))
            self.overall_rework_percentage = Decimal(
                self.total_rework / self.total_produced * 100
            ).quantize(Decimal('0.01'))
            self.overall_rejection_percentage = Decimal(
                self.total_rejection / self.total_produced * 100
            ).quantize(Decimal('0.01'))
            self.overall_yield_percentage = Decimal(
                (self.total_ok + self.total_rework) / self.total_produced * 100
            ).quantize(Decimal('0.01'))
        
        # Calculate completion based on order quantity
        if self.order.ordered_quantity > 0:
            self.completion_percentage = Decimal(
                self.total_ok / self.order.ordered_quantity * 100
            ).quantize(Decimal('0.01'))
            if self.completion_percentage > 100:
                self.completion_percentage = Decimal('100.00')
        
        self.save()