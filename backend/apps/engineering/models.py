"""
Models for Engineering app - Drawing management with version control.
"""

import os
import uuid
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError


def validate_drawing_file(value):
    """Validate drawing file extension."""
    ext = os.path.splitext(value.name)[1].lower()
    allowed_extensions = getattr(
        settings, 'ALLOWED_DRAWING_EXTENSIONS',
        ['.pdf', '.dwg', '.dxf', '.step', '.stp', '.igs', '.iges']
    )
    if ext not in allowed_extensions:
        raise ValidationError(
            f'File type not allowed. Allowed types: {", ".join(allowed_extensions)}'
        )


def drawing_upload_path(instance, filename):
    """Generate upload path for drawing files."""
    order_id = instance.order.id if instance.order else 'no_order'
    return f'drawings/{order_id}/{instance.version}/{filename}'


class Drawing(models.Model):
    """Drawing model for storing engineering drawings linked to orders."""

    class DrawingType(models.TextChoices):
        PRODUCTION = 'production', _('Production Drawing')
        ASSEMBLY = 'assembly', _('Assembly Drawing')
        DETAIL = 'detail', _('Detail Drawing')
        LAYOUT = 'layout', _('Layout Drawing')
        SCHEMATIC = 'schematic', _('Schematic')
        THREE_D = '3d', _('3D Model')
        OTHER = 'other', _('Other')

    class Status(models.TextChoices):
        DRAFT = 'draft', _('Draft')
        PENDING_REVIEW = 'pending_review', _('Pending Review')
        APPROVED = 'approved', _('Approved')
        REJECTED = 'rejected', _('Rejected')
        SUPERSEDED = 'superseded', _('Superseded')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(
        'crm.Order',
        on_delete=models.CASCADE,
        related_name='drawings'
    )
    
    # Drawing Information
    drawing_number = models.CharField(max_length=100)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    drawing_type = models.CharField(
        max_length=20,
        choices=DrawingType.choices,
        default=DrawingType.PRODUCTION
    )
    
    # Version Control
    version = models.PositiveIntegerField(default=1)
    revision = models.CharField(max_length=10, default='A')
    is_latest = models.BooleanField(default=True)
    parent_drawing = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='revisions'
    )
    
    # File
    file = models.FileField(
        upload_to=drawing_upload_path,
        validators=[validate_drawing_file]
    )
    file_size = models.PositiveIntegerField(blank=True, null=True)
    file_type = models.CharField(max_length=20, blank=True, null=True)
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT
    )
    
    # Metadata
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_drawings'
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_drawings'
    )
    approved_at = models.DateTimeField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Drawing')
        verbose_name_plural = _('Drawings')
        ordering = ['-created_at']
        unique_together = ['order', 'drawing_number', 'version']

    def __str__(self):
        return f"{self.drawing_number} v{self.version} - {self.title}"

    def save(self, *args, **kwargs):
        # Set file metadata
        if self.file:
            self.file_size = self.file.size
            self.file_type = os.path.splitext(self.file.name)[1].lower().replace('.', '')
        
        # Mark previous versions as not latest
        if self.is_latest:
            Drawing.objects.filter(
                order=self.order,
                drawing_number=self.drawing_number,
                is_latest=True
            ).exclude(pk=self.pk).update(is_latest=False)
        
        super().save(*args, **kwargs)

    def create_new_version(self, file, user, notes=None):
        """Create a new version of this drawing."""
        new_version = Drawing.objects.create(
            order=self.order,
            drawing_number=self.drawing_number,
            title=self.title,
            description=self.description,
            drawing_type=self.drawing_type,
            version=self.version + 1,
            revision=self._get_next_revision(),
            is_latest=True,
            parent_drawing=self,
            file=file,
            status=Drawing.Status.DRAFT,
            created_by=user,
            notes=notes
        )
        
        # Mark this version as not latest
        self.is_latest = False
        self.status = Drawing.Status.SUPERSEDED
        self.save()
        
        return new_version

    def _get_next_revision(self):
        """Get next revision letter."""
        current = self.revision
        if current.isalpha() and len(current) == 1:
            return chr(ord(current) + 1)
        return f"{current}.1"


class DrawingComment(models.Model):
    """Comments on drawings for review and feedback."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    drawing = models.ForeignKey(
        Drawing,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Drawing Comment')
        verbose_name_plural = _('Drawing Comments')
        ordering = ['-created_at']

    def __str__(self):
        return f"Comment on {self.drawing.drawing_number} by {self.user}"