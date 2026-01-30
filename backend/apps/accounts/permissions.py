"""
Custom permission classes for role-based access control.
"""

from rest_framework import permissions
from .models import RolePermission


class IsAdmin(permissions.BasePermission):
    """Permission class for admin users only."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin


class IsSales(permissions.BasePermission):
    """Permission class for sales users."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            request.user.is_admin or request.user.is_sales
        )


class IsEngineering(permissions.BasePermission):
    """Permission class for engineering users."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            request.user.is_admin or request.user.is_engineering
        )


class IsProduction(permissions.BasePermission):
    """Permission class for production users."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            request.user.is_admin or request.user.is_production
        )


class IsQuality(permissions.BasePermission):
    """Permission class for quality/inspection users."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            request.user.is_admin or request.user.is_quality
        )


class IsLogistics(permissions.BasePermission):
    """Permission class for logistics users."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            request.user.is_admin or request.user.is_logistics
        )


class IsManagement(permissions.BasePermission):
    """Permission class for management users (read-only)."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_admin:
            return True
        
        if request.user.is_management:
            # Management has read-only access
            return request.method in permissions.SAFE_METHODS
        
        return False


class IsAdminOrReadOnly(permissions.BasePermission):
    """Admin has full access, others have read-only."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_admin:
            return True
        
        return request.method in permissions.SAFE_METHODS


class ModulePermission(permissions.BasePermission):
    """
    Dynamic permission class based on module and role.
    """
    module = None  # Override in subclass or view

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_admin:
            return True

        # Get module from view or class
        module = getattr(view, 'permission_module', self.module)
        if not module:
            return False

        try:
            role_perm = RolePermission.objects.get(
                role=request.user.role,
                module=module
            )
        except RolePermission.DoesNotExist:
            return False

        if role_perm.access_level == RolePermission.AccessLevel.NONE:
            return False
        elif role_perm.access_level == RolePermission.AccessLevel.READ:
            return request.method in permissions.SAFE_METHODS
        elif role_perm.access_level in [
            RolePermission.AccessLevel.WRITE,
            RolePermission.AccessLevel.FULL
        ]:
            return True
        
        return False