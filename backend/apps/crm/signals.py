"""
Signals for CRM app.
"""

from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from .models import Order, OrderStatusHistory


@receiver(pre_save, sender=Order)
def track_status_change(sender, instance, **kwargs):
    """Store previous status before save for history tracking."""
    if instance.pk:
        try:
            old_instance = Order.objects.get(pk=instance.pk)
            instance._previous_status = old_instance.status
        except Order.DoesNotExist:
            instance._previous_status = None
    else:
        instance._previous_status = None


@receiver(post_save, sender=Order)
def create_status_history(sender, instance, created, **kwargs):
    """Create status history entry when status changes."""
    previous_status = getattr(instance, '_previous_status', None)
    
    if created:
        # New order - create initial status history
        OrderStatusHistory.objects.create(
            order=instance,
            previous_status=None,
            new_status=instance.status,
            changed_by=instance.created_by
        )
    elif previous_status and previous_status != instance.status:
        # Status changed - create history entry
        OrderStatusHistory.objects.create(
            order=instance,
            previous_status=previous_status,
            new_status=instance.status,
            changed_by=None  # Will be set by view if available
        )