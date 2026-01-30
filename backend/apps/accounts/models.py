"""
Custom User model and Role management for Manufacturing ERP.
"""

from django.contrib.auth.models import AbstractUser, BaseUserManager, Group, Permission
from django.db import models
from django.utils.translation import gettext_lazy as _


class UserManager(BaseUserManager):
    """Custom user manager for email-based authentication."""

    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular user with the given email and password."""
        if not email:
            raise ValueError(_('The Email field must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a superuser with the given email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """
    Custom User model for Manufacturing ERP.
    Uses email as the primary identifier instead of username.
    """

    class Role(models.TextChoices):
        ADMIN = 'admin', _('Admin')
        SALES = 'sales', _('Sales / CRM')
        ENGINEERING = 'engineering', _('Engineering')
        PRODUCTION = 'production', _('Production')
        QUALITY = 'quality', _('Quality / Inspection')
        LOGISTICS = 'logistics', _('Logistics')
        MANAGEMENT = 'management', _('Management')

    # Remove username field, use email instead
    username = None
    email = models.EmailField(_('email address'), unique=True)
    
    # Additional fields
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.SALES,
        verbose_name=_('User Role')
    )
    phone = models.CharField(max_length=20, blank=True, null=True)
    department = models.CharField(max_length=100, blank=True, null=True)
    employee_id = models.CharField(max_length=50, blank=True, null=True, unique=True)
    profile_picture = models.ImageField(
        upload_to='profile_pictures/',
        blank=True,
        null=True
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    objects = UserManager()

    class Meta:
        verbose_name = _('User')
        verbose_name_plural = _('Users')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"

    def get_full_name(self):
        """Return the first_name plus the last_name, with a space in between."""
        full_name = f"{self.first_name} {self.last_name}".strip()
        return full_name if full_name else self.email

    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN or self.is_superuser

    @property
    def is_sales(self):
        return self.role == self.Role.SALES

    @property
    def is_engineering(self):
        return self.role == self.Role.ENGINEERING

    @property
    def is_production(self):
        return self.role == self.Role.PRODUCTION

    @property
    def is_quality(self):
        return self.role == self.Role.QUALITY

    @property
    def is_logistics(self):
        return self.role == self.Role.LOGISTICS

    @property
    def is_management(self):
        return self.role == self.Role.MANAGEMENT


class RolePermission(models.Model):
    """
    Model to define custom permissions for each role.
    Maps roles to specific module access permissions.
    """

    class Module(models.TextChoices):
        CRM = 'crm', _('CRM')
        ENGINEERING = 'engineering', _('Engineering')
        MATERIALS = 'materials', _('Materials')
        PRODUCTION = 'production', _('Production')
        FABRICATION = 'fabrication', _('Fabrication')
        SURFACE_TREATMENT = 'surface_treatment', _('Surface Treatment')
        INSPECTION = 'inspection', _('Inspection')
        LOGISTICS = 'logistics', _('Logistics')
        DASHBOARDS = 'dashboards', _('Dashboards')
        AUDIT = 'audit', _('Audit')

    class AccessLevel(models.TextChoices):
        NONE = 'none', _('No Access')
        READ = 'read', _('Read Only')
        WRITE = 'write', _('Read & Write')
        FULL = 'full', _('Full Access')

    role = models.CharField(max_length=20, choices=User.Role.choices)
    module = models.CharField(max_length=50, choices=Module.choices)
    access_level = models.CharField(
        max_length=10,
        choices=AccessLevel.choices,
        default=AccessLevel.NONE
    )

    class Meta:
        verbose_name = _('Role Permission')
        verbose_name_plural = _('Role Permissions')
        unique_together = ['role', 'module']

    def __str__(self):
        return f"{self.role} - {self.module}: {self.access_level}"