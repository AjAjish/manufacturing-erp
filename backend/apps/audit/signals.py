"""
Signals for Audit app - Auto-track model changes.
"""

from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from .models import AuditLog

# Models to track
TRACKED_MODELS = [
    'crm.Order',
    'crm.Customer',
    'engineering.Drawing',
    'materials.OrderMaterial',
    'production.ProductionRecord',
    'fabrication.OrderFabrication',
    'surface_treatment.OrderSurfaceTreatment',
    'inspection.OrderInspection',
    'logistics.OrderDispatch',
]


def get_model_changes(instance, old_instance):
    """Get changes between old and new instance."""
    changes = {}
    for field in instance._meta.fields:
        field_name = field.name
        if field_name in ['created_at', 'updated_at', 'id']:
            continue
        
        old_value = getattr(old_instance, field_name, None) if old_instance else None
        new_value = getattr(instance, field_name, None)
        
        # Handle foreign keys
        if hasattr(old_value, 'pk'):
            old_value = str(old_value.pk)
        if hasattr(new_value, 'pk'):
            new_value = str(new_value.pk)
        
        if old_value != new_value:
            changes[field_name] = {
                'old': str(old_value) if old_value is not None else None,
                'new': str(new_value) if new_value is not None else None
            }
    
    return changes


def create_audit_log(instance, action, old_instance=None, user=None):
    """Create an audit log entry."""
    model_label = f"{instance._meta.app_label}.{instance._meta.model_name}"
    
    if model_label.lower() not in [m.lower() for m in TRACKED_MODELS]:
        return
    
    content_type = ContentType.objects.get_for_model(instance)
    
    changes = None
    old_values = None
    new_values = None
    
    if action == AuditLog.Action.UPDATE and old_instance:
        changes = get_model_changes(instance, old_instance)
        if not changes:  # No actual changes
            return
    
    AuditLog.objects.create(
        user=user,
        action=action,
        content_type=content_type,
        object_id=str(instance.pk),
        model_name=instance._meta.model_name,
        object_repr=str(instance)[:255],
        changes=changes,
    )