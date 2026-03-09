"""
Service helpers for CRM business logic.
"""

from .models import Order, OrderStatusHistory


ORDER_STATUS_PROGRESS = {
    Order.Status.DRAFT: 0,
    Order.Status.QUOTED: 10,
    Order.Status.CONFIRMED: 20,
    Order.Status.IN_PRODUCTION: 50,
    Order.Status.QUALITY_CHECK: 70,
    Order.Status.READY_FOR_DISPATCH: 85,
    Order.Status.DISPATCHED: 95,
    Order.Status.COMPLETED: 100,
    Order.Status.CANCELLED: 0,
    Order.Status.ON_HOLD: 40,
}


def get_status_progress(status_value):
    """Return canonical progress percentage for an order status."""
    return ORDER_STATUS_PROGRESS.get(status_value, 0)


def update_order_status(order, new_status, changed_by=None, notes=''):
    """Update order status consistently with progress and history."""
    previous_status = order.status

    if previous_status == new_status:
        expected_progress = get_status_progress(new_status)
        if order.status_percentage != expected_progress:
            order.status_percentage = expected_progress
            order.save(update_fields=['status_percentage', 'updated_at'])
        return order

    order.status = new_status
    order.status_percentage = get_status_progress(new_status)
    order._skip_auto_status_history = True
    order.save(update_fields=['status', 'status_percentage', 'updated_at'])

    OrderStatusHistory.objects.create(
        order=order,
        previous_status=previous_status,
        new_status=new_status,
        changed_by=changed_by,
        notes=notes or ''
    )

    return order
