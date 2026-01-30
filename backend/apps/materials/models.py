"""
Models for Materials app - Material tracking and inventory.
"""

import uuid
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator
from decimal import Decimal


class MaterialType(models.Model):
    """Material type/category definition."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Material Type')
        verbose_name_plural = _('Material Types')
        ordering = ['name']

    def __str__(self):
        return self.name


class Material(models.Model):
    """Material master data."""

    class Unit(models.TextChoices):
        KG = 'kg', _('Kilogram')
        GRAM = 'gram', _('Gram')
        METER = 'meter', _('Meter')
        MM = 'mm', _('Millimeter')
        PIECE = 'piece', _('Piece')
        SHEET = 'sheet', _('Sheet')
        LITER = 'liter', _('Liter')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    material_type = models.ForeignKey(
        MaterialType,
        on_delete=models.PROTECT,
        related_name='materials'
    )
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    
    # Specifications
    grade = models.CharField(max_length=100, blank=True, null=True)
    thickness = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        blank=True,
        null=True,
        help_text=_('Thickness in mm')
    )
    width = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        blank=True,
        null=True,
        help_text=_('Width in mm')
    )
    length = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        blank=True,
        null=True,
        help_text=_('Length in mm')
    )
    
    # Unit and Pricing
    unit = models.CharField(
        max_length=10,
        choices=Unit.choices,
        default=Unit.KG
    )
    unit_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00')
    )
    
    # Inventory
    stock_quantity = models.DecimalField(
        max_digits=12,
        decimal_places=3,
        default=Decimal('0.000')
    )
    minimum_stock = models.DecimalField(
        max_digits=12,
        decimal_places=3,
        default=Decimal('0.000'),
        help_text=_('Minimum stock level for alerts')
    )
    
    # Metadata
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Material')
        verbose_name_plural = _('Materials')
        ordering = ['code']

    def __str__(self):
        return f"{self.code} - {self.name}"

    @property
    def is_low_stock(self):
        return self.stock_quantity <= self.minimum_stock

    @property
    def dimensions(self):
        dims = []
        if self.thickness:
            dims.append(f"T:{self.thickness}mm")
        if self.width:
            dims.append(f"W:{self.width}mm")
        if self.length:
            dims.append(f"L:{self.length}mm")
        return " x ".join(dims) if dims else "N/A"


class OrderMaterial(models.Model):
    """Materials required and issued for an order."""

    class Status(models.TextChoices):
        PLANNED = 'planned', _('Planned')
        REQUESTED = 'requested', _('Requested')
        PARTIALLY_ISSUED = 'partially_issued', _('Partially Issued')
        FULLY_ISSUED = 'fully_issued', _('Fully Issued')
        RETURNED = 'returned', _('Returned')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(
        'crm.Order',
        on_delete=models.CASCADE,
        related_name='materials'
    )
    material = models.ForeignKey(
        Material,
        on_delete=models.PROTECT,
        related_name='order_materials'
    )
    
    # Quantities
    required_quantity = models.DecimalField(
        max_digits=12,
        decimal_places=3,
        validators=[MinValueValidator(Decimal('0.001'))]
    )
    issued_quantity = models.DecimalField(
        max_digits=12,
        decimal_places=3,
        default=Decimal('0.000')
    )
    consumed_quantity = models.DecimalField(
        max_digits=12,
        decimal_places=3,
        default=Decimal('0.000')
    )
    returned_quantity = models.DecimalField(
        max_digits=12,
        decimal_places=3,
        default=Decimal('0.000')
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PLANNED
    )
    
    # Notes
    notes = models.TextField(blank=True, null=True)
    
    # Metadata
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_order_materials'
    )
    issued_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='issued_order_materials'
    )
    issued_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Order Material')
        verbose_name_plural = _('Order Materials')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.order.quote_number} - {self.material.name}"

    @property
    def pending_quantity(self):
        return self.required_quantity - self.issued_quantity

    @property
    def utilization_percentage(self):
        if self.issued_quantity > 0:
            return round((self.consumed_quantity / self.issued_quantity) * 100, 2)
        return 0

    def issue_material(self, quantity, user):
        """Issue material and update stock."""
        from django.utils import timezone
        
        if quantity > self.material.stock_quantity:
            raise ValueError('Insufficient stock available.')
        
        if quantity > self.pending_quantity:
            raise ValueError('Cannot issue more than required quantity.')
        
        self.issued_quantity += quantity
        self.issued_by = user
        self.issued_at = timezone.now()
        
        # Update status
        if self.issued_quantity >= self.required_quantity:
            self.status = self.Status.FULLY_ISSUED
        elif self.issued_quantity > 0:
            self.status = self.Status.PARTIALLY_ISSUED
        
        self.save()
        
        # Update material stock
        self.material.stock_quantity -= quantity
        self.material.save()


class MaterialTransaction(models.Model):
    """Track all material transactions (in/out)."""

    class TransactionType(models.TextChoices):
        RECEIPT = 'receipt', _('Receipt')
        ISSUE = 'issue', _('Issue')
        RETURN = 'return', _('Return')
        ADJUSTMENT = 'adjustment', _('Adjustment')
        SCRAP = 'scrap', _('Scrap')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    material = models.ForeignKey(
        Material,
        on_delete=models.PROTECT,
        related_name='transactions'
    )
    order = models.ForeignKey(
        'crm.Order',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='material_transactions'
    )
    transaction_type = models.CharField(
        max_length=20,
        choices=TransactionType.choices
    )
    quantity = models.DecimalField(max_digits=12, decimal_places=3)
    stock_before = models.DecimalField(max_digits=12, decimal_places=3)
    stock_after = models.DecimalField(max_digits=12, decimal_places=3)
    reference_number = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Material Transaction')
        verbose_name_plural = _('Material Transactions')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.material.code} - {self.transaction_type}: {self.quantity}"