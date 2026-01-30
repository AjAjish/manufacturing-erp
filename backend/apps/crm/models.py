"""
Models for CRM app - Customers and Orders.
"""

from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid


class Customer(models.Model):
    """Customer model for storing client information."""

    class CustomerType(models.TextChoices):
        REGULAR = 'regular', _('Regular')
        PREMIUM = 'premium', _('Premium')
        VIP = 'vip', _('VIP')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255)
    customer_type = models.CharField(
        max_length=20,
        choices=CustomerType.choices,
        default=CustomerType.REGULAR
    )
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    alternate_phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100, default='India')
    postal_code = models.CharField(max_length=20)
    gst_number = models.CharField(max_length=50, blank=True, null=True)
    pan_number = models.CharField(max_length=20, blank=True, null=True)
    
    # Contact person details
    contact_person = models.CharField(max_length=255, blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    
    # Metadata
    notes = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_customers'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Customer')
        verbose_name_plural = _('Customers')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.company_name} ({self.name})"

    @property
    def total_orders(self):
        return self.orders.count()

    @property
    def active_orders(self):
        return self.orders.exclude(
            status__in=[Order.Status.COMPLETED, Order.Status.CANCELLED]
        ).count()


class Order(models.Model):
    """
    Central Order model that links all departments and processes.
    This is the main entity that tracks the entire manufacturing workflow.
    """

    class Status(models.TextChoices):
        DRAFT = 'draft', _('Draft')
        QUOTED = 'quoted', _('Quoted')
        CONFIRMED = 'confirmed', _('Confirmed')
        IN_PRODUCTION = 'in_production', _('In Production')
        QUALITY_CHECK = 'quality_check', _('Quality Check')
        READY_FOR_DISPATCH = 'ready_for_dispatch', _('Ready for Dispatch')
        DISPATCHED = 'dispatched', _('Dispatched')
        COMPLETED = 'completed', _('Completed')
        CANCELLED = 'cancelled', _('Cancelled')
        ON_HOLD = 'on_hold', _('On Hold')

    class Priority(models.TextChoices):
        LOW = 'low', _('Low')
        NORMAL = 'normal', _('Normal')
        HIGH = 'high', _('High')
        URGENT = 'urgent', _('Urgent')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Reference Numbers
    quote_number = models.CharField(max_length=50, unique=True)
    po_number = models.CharField(max_length=50, blank=True, null=True, verbose_name=_('PO Number'))
    work_order_number = models.CharField(max_length=50, blank=True, null=True)
    invoice_number = models.CharField(max_length=50, blank=True, null=True)
    grn_number = models.CharField(max_length=50, blank=True, null=True, verbose_name=_('GRN Number'))
    
    # Order Details
    customer = models.ForeignKey(
        Customer,
        on_delete=models.PROTECT,
        related_name='orders'
    )
    project_name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    
    # Quantities
    ordered_quantity = models.PositiveIntegerField(default=1)
    
    # Timing
    order_date = models.DateField(auto_now_add=True)
    planned_lead_time = models.PositiveIntegerField(
        help_text=_('Planned lead time in days'),
        default=30
    )
    actual_lead_time = models.PositiveIntegerField(
        help_text=_('Actual lead time in days'),
        blank=True,
        null=True
    )
    expected_delivery_date = models.DateField(blank=True, null=True)
    actual_delivery_date = models.DateField(blank=True, null=True)
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT
    )
    status_percentage = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text=_('Order completion percentage')
    )
    priority = models.CharField(
        max_length=10,
        choices=Priority.choices,
        default=Priority.NORMAL
    )
    
    # Financial
    unit_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00
    )
    total_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0.00
    )
    
    # Notes
    remarks = models.TextField(blank=True, null=True)
    internal_notes = models.TextField(blank=True, null=True)
    
    # Metadata
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_orders'
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_orders'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Order')
        verbose_name_plural = _('Orders')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.quote_number} - {self.project_name}"

    def save(self, *args, **kwargs):
        # Auto-calculate total amount
        self.total_amount = self.unit_price * self.ordered_quantity
        super().save(*args, **kwargs)

    @property
    def is_delayed(self):
        """Check if order is delayed based on expected delivery date."""
        from django.utils import timezone
        if self.expected_delivery_date and self.status not in [
            self.Status.COMPLETED, self.Status.CANCELLED, self.Status.DISPATCHED
        ]:
            return timezone.now().date() > self.expected_delivery_date
        return False

    @property
    def days_remaining(self):
        """Calculate days remaining until expected delivery."""
        from django.utils import timezone
        if self.expected_delivery_date:
            delta = self.expected_delivery_date - timezone.now().date()
            return delta.days
        return None


class OrderStatusHistory(models.Model):
    """Track order status changes over time."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='status_history'
    )
    previous_status = models.CharField(
        max_length=20,
        choices=Order.Status.choices,
        blank=True,
        null=True
    )
    new_status = models.CharField(
        max_length=20,
        choices=Order.Status.choices
    )
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Order Status History')
        verbose_name_plural = _('Order Status Histories')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.order.quote_number}: {self.previous_status} -> {self.new_status}"