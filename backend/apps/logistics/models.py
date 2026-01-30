"""
Models for Logistics app - Packing and dispatch management.
"""

import uuid
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class PackingStandard(models.Model):
    """Packing standards/methods."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Packing Standard')
        verbose_name_plural = _('Packing Standards')
        ordering = ['name']

    def __str__(self):
        return f"{self.code} - {self.name}"


class OrderDispatch(models.Model):
    """Dispatch records for orders."""

    class DispatchStatus(models.TextChoices):
        PENDING = 'pending', _('Pending')
        PACKING = 'packing', _('Packing in Progress')
        PACKED = 'packed', _('Packed')
        READY = 'ready', _('Ready for Dispatch')
        DISPATCHED = 'dispatched', _('Dispatched')
        IN_TRANSIT = 'in_transit', _('In Transit')
        DELIVERED = 'delivered', _('Delivered')
        RETURNED = 'returned', _('Returned')

    class TransportMode(models.TextChoices):
        ROAD = 'road', _('Road Transport')
        RAIL = 'rail', _('Rail Transport')
        AIR = 'air', _('Air Freight')
        SEA = 'sea', _('Sea Freight')
        COURIER = 'courier', _('Courier')
        SELF_PICKUP = 'self_pickup', _('Self Pickup')

    class TransportScope(models.TextChoices):
        EX_WORKS = 'ex_works', _('Ex-Works')
        FOB = 'fob', _('FOB')
        CIF = 'cif', _('CIF')
        DOOR_DELIVERY = 'door_delivery', _('Door Delivery')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.OneToOneField(
        'crm.Order',
        on_delete=models.CASCADE,
        related_name='dispatch'
    )
    
    # Packing
    packing_standard = models.ForeignKey(
        PackingStandard,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='dispatches'
    )
    packing_details = models.TextField(blank=True, null=True)
    total_packages = models.PositiveIntegerField(default=0)
    gross_weight = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        help_text=_('Gross weight in KG')
    )
    net_weight = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        help_text=_('Net weight in KG')
    )
    dimensions = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text=_('L x W x H in cm')
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=DispatchStatus.choices,
        default=DispatchStatus.PENDING
    )
    
    # Transport
    transport_mode = models.CharField(
        max_length=20,
        choices=TransportMode.choices,
        default=TransportMode.ROAD
    )
    transport_scope = models.CharField(
        max_length=20,
        choices=TransportScope.choices,
        default=TransportScope.EX_WORKS
    )
    transporter_name = models.CharField(max_length=255, blank=True, null=True)
    vehicle_number = models.CharField(max_length=50, blank=True, null=True)
    driver_name = models.CharField(max_length=100, blank=True, null=True)
    driver_phone = models.CharField(max_length=20, blank=True, null=True)
    tracking_number = models.CharField(max_length=100, blank=True, null=True)
    
    # Documents
    invoice_number = models.CharField(max_length=50, blank=True, null=True)
    e_way_bill_number = models.CharField(max_length=50, blank=True, null=True)
    lr_number = models.CharField(max_length=50, blank=True, null=True, verbose_name=_('LR Number'))
    
    # Dates
    planned_dispatch_date = models.DateField(blank=True, null=True)
    actual_dispatch_date = models.DateField(blank=True, null=True)
    dispatched_at = models.DateTimeField(blank=True, null=True)
    expected_delivery_date = models.DateField(blank=True, null=True)
    actual_delivery_date = models.DateField(blank=True, null=True)
    delivered_at = models.DateTimeField(blank=True, null=True)
    
    # Delivery Address (can be different from customer address)
    delivery_address = models.TextField(blank=True, null=True)
    delivery_contact_name = models.CharField(max_length=100, blank=True, null=True)
    delivery_contact_phone = models.CharField(max_length=20, blank=True, null=True)
    
    # Notes
    remarks = models.TextField(blank=True, null=True)
    special_instructions = models.TextField(blank=True, null=True)
    
    # Metadata
    packed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='packed_dispatches'
    )
    dispatched_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='dispatched_orders'
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_dispatches'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Order Dispatch')
        verbose_name_plural = _('Order Dispatches')
        ordering = ['-created_at']

    def __str__(self):
        return f"Dispatch: {self.order.quote_number}"

    @property
    def can_dispatch(self):
        """Check if order can be dispatched (QA approved)."""
        from apps.inspection.models import OrderInspection, InspectionType
        
        pdi_inspection = self.order.inspections.filter(
            inspection_type__stage=InspectionType.Stage.PDI
        ).first()
        
        if pdi_inspection:
            return pdi_inspection.is_qa_approved and pdi_inspection.result == OrderInspection.Result.PASS
        
        # If no PDI required, check if order status allows dispatch
        from apps.crm.models import Order
        return self.order.status == Order.Status.READY_FOR_DISPATCH

    @property
    def is_delayed(self):
        """Check if dispatch is delayed."""
        from django.utils import timezone
        if self.planned_dispatch_date and self.status not in [
            self.DispatchStatus.DISPATCHED,
            self.DispatchStatus.IN_TRANSIT,
            self.DispatchStatus.DELIVERED
        ]:
            return timezone.now().date() > self.planned_dispatch_date
        return False


class DispatchDocument(models.Model):
    """Documents attached to dispatch."""

    class DocumentType(models.TextChoices):
        INVOICE = 'invoice', _('Invoice')
        PACKING_LIST = 'packing_list', _('Packing List')
        DELIVERY_CHALLAN = 'delivery_challan', _('Delivery Challan')
        E_WAY_BILL = 'e_way_bill', _('E-Way Bill')
        TEST_CERTIFICATE = 'test_certificate', _('Test Certificate')
        WARRANTY_CARD = 'warranty_card', _('Warranty Card')
        OTHER = 'other', _('Other')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    dispatch = models.ForeignKey(
        OrderDispatch,
        on_delete=models.CASCADE,
        related_name='documents'
    )
    document_type = models.CharField(
        max_length=20,
        choices=DocumentType.choices
    )
    document_number = models.CharField(max_length=100, blank=True, null=True)
    file = models.FileField(upload_to='dispatch_documents/')
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Dispatch Document')
        verbose_name_plural = _('Dispatch Documents')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.dispatch.order.quote_number} - {self.get_document_type_display()}"