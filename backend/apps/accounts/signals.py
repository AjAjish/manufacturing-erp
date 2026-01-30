"""
Signals for accounts app - Auto-assign groups based on role.
"""

from django.db.models.signals import post_save, post_migrate
from django.dispatch import receiver
from django.contrib.auth.models import Group
from .models import User, RolePermission


@receiver(post_migrate)
def create_default_groups(sender, **kwargs):
    """Create default groups after migrations."""
    if sender.name == 'apps.accounts':
        roles = [
            ('admin', 'Admin'),
            ('sales', 'Sales / CRM'),
            ('engineering', 'Engineering'),
            ('production', 'Production'),
            ('quality', 'Quality / Inspection'),
            ('logistics', 'Logistics'),
            ('management', 'Management'),
        ]
        for role_code, role_name in roles:
            Group.objects.get_or_create(name=role_code)


@receiver(post_save, sender=User)
def assign_user_to_group(sender, instance, created, **kwargs):
    """Automatically assign user to group based on role."""
    if instance.role:
        # Remove from all role groups first
        role_groups = Group.objects.filter(
            name__in=[choice[0] for choice in User.Role.choices]
        )
        instance.groups.remove(*role_groups)
        
        # Add to the appropriate group
        group, _ = Group.objects.get_or_create(name=instance.role)
        instance.groups.add(group)