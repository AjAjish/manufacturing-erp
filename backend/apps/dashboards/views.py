"""
Views for Dashboards app - Analytics and KPIs.
"""

from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Sum, Avg, F, Q
from django.db.models.functions import TruncDate, TruncMonth, TruncWeek
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from apps.crm.models import Order, Customer
from apps.production.models import ProductionRecord, ProductionSummary
from apps.fabrication.models import OrderFabrication
from apps.inspection.models import OrderInspection
from apps.logistics.models import OrderDispatch


class DashboardOverviewView(views.APIView):
    """Overall dashboard with key metrics."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        thirty_days_ago = today - timedelta(days=30)
        
        # Order Statistics
        total_orders = Order.objects.count()
        active_orders = Order.objects.exclude(
            status__in=[Order.Status.COMPLETED, Order.Status.CANCELLED]
        ).count()
        
        orders_this_month = Order.objects.filter(
            created_at__date__gte=today.replace(day=1)
        ).count()
        
        # Delayed Orders
        delayed_orders = Order.objects.filter(
            expected_delivery_date__lt=today
        ).exclude(
            status__in=[Order.Status.COMPLETED, Order.Status.CANCELLED, Order.Status.DISPATCHED]
        ).count()
        
        # Customer Statistics
        total_customers = Customer.objects.filter(is_active=True).count()
        new_customers_this_month = Customer.objects.filter(
            created_at__date__gte=today.replace(day=1)
        ).count()
        
        # Production Statistics
        production_stats = ProductionRecord.objects.filter(
            production_date__gte=thirty_days_ago
        ).aggregate(
            total_produced=Sum('produced_quantity'),
            total_ok=Sum('ok_quantity'),
            total_rejection=Sum('rejection_quantity'),
            avg_yield=Avg('total_yield_percentage')
        )
        
        # Order Status Distribution
        status_distribution = Order.objects.values('status').annotate(
            count=Count('id')
        ).order_by('status')
        
        # Revenue (last 30 days)
        revenue = Order.objects.filter(
            status=Order.Status.COMPLETED,
            actual_delivery_date__gte=thirty_days_ago
        ).aggregate(total=Sum('total_amount'))
        
        return Response({
            'orders': {
                'total': total_orders,
                'active': active_orders,
                'this_month': orders_this_month,
                'delayed': delayed_orders,
            },
            'customers': {
                'total': total_customers,
                'new_this_month': new_customers_this_month,
            },
            'production': {
                'total_produced': production_stats['total_produced'] or 0,
                'total_ok': production_stats['total_ok'] or 0,
                'total_rejection': production_stats['total_rejection'] or 0,
                'avg_yield': round(production_stats['avg_yield'] or 0, 2),
            },
            'status_distribution': list(status_distribution),
            'revenue_30_days': float(revenue['total'] or 0),
        })


class OrderStatusTrackingView(views.APIView):
    """Order status tracking and workflow."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        order_id = request.query_params.get('order_id')
        
        if order_id:
            try:
                order = Order.objects.get(id=order_id)
                
                # Get all related data
                materials = order.materials.all().values(
                    'material__name', 'required_quantity', 'issued_quantity', 'status'
                )
                
                fabrications = order.fabrication_processes.all().values(
                    'process__name', 'status', 'completed_quantity', 'planned_quantity'
                )
                
                treatments = order.surface_treatments.all().values(
                    'treatment_type__name', 'status', 'completed_quantity', 'planned_quantity'
                )
                
                inspections = order.inspections.all().values(
                    'inspection_type__name', 'result', 'is_qa_approved'
                )
                
                dispatch = None
                if hasattr(order, 'dispatch'):
                    dispatch = {
                        'status': order.dispatch.status,
                        'planned_dispatch_date': order.dispatch.planned_dispatch_date,
                        'actual_dispatch_date': order.dispatch.actual_dispatch_date,
                    }
                
                return Response({
                    'order': {
                        'id': str(order.id),
                        'quote_number': order.quote_number,
                        'project_name': order.project_name,
                        'status': order.status,
                        'status_percentage': order.status_percentage,
                    },
                    'materials': list(materials),
                    'fabrications': list(fabrications),
                    'surface_treatments': list(treatments),
                    'inspections': list(inspections),
                    'dispatch': dispatch,
                })
            except Order.DoesNotExist:
                return Response(
                    {'detail': 'Order not found.'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        # Return summary for all active orders
        active_orders = Order.objects.exclude(
            status__in=[Order.Status.COMPLETED, Order.Status.CANCELLED]
        ).values(
            'id', 'quote_number', 'project_name', 'status',
            'status_percentage', 'expected_delivery_date'
        )
        
        return Response({'active_orders': list(active_orders)})


class DelayedOrdersView(views.APIView):
    """Get delayed orders with details."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        
        delayed_orders = Order.objects.filter(
            expected_delivery_date__lt=today
        ).exclude(
            status__in=[Order.Status.COMPLETED, Order.Status.CANCELLED, Order.Status.DISPATCHED]
        ).select_related('customer').values(
            'id', 'quote_number', 'project_name', 'customer__company_name',
            'status', 'expected_delivery_date', 'priority'
        ).order_by('expected_delivery_date')
        
        # Calculate days delayed properly
        result = []
        for order in delayed_orders:
            order['days_delayed'] = (today - order['expected_delivery_date']).days
            result.append(order)
        
        return Response({
            'count': len(result),
            'orders': result
        })


class ProductionAnalyticsView(views.APIView):
    """Production yield and rejection analysis."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now().date() - timedelta(days=days)
        
        # Daily production trends
        daily_production = ProductionRecord.objects.filter(
            production_date__gte=start_date
        ).values('production_date').annotate(
            total_produced=Sum('produced_quantity'),
            total_ok=Sum('ok_quantity'),
            total_rework=Sum('rework_quantity'),
            total_rejection=Sum('rejection_quantity'),
            avg_yield=Avg('total_yield_percentage')
        ).order_by('production_date')
        
        # Overall statistics
        overall = ProductionRecord.objects.filter(
            production_date__gte=start_date
        ).aggregate(
            total_produced=Sum('produced_quantity'),
            total_ok=Sum('ok_quantity'),
            total_rework=Sum('rework_quantity'),
            total_rejection=Sum('rejection_quantity'),
            avg_yield=Avg('total_yield_percentage'),
            avg_ok_percentage=Avg('ok_percentage'),
            avg_rejection_percentage=Avg('rejection_percentage')
        )
        
        # Top rejection reasons (if tracked)
        rejection_by_order = ProductionRecord.objects.filter(
            production_date__gte=start_date,
            rejection_quantity__gt=0
        ).values(
            'order__quote_number', 'order__project_name'
        ).annotate(
            total_rejection=Sum('rejection_quantity')
        ).order_by('-total_rejection')[:10]
        
        return Response({
            'period_days': days,
            'daily_trends': list(daily_production),
            'overall_statistics': {
                'total_produced': overall['total_produced'] or 0,
                'total_ok': overall['total_ok'] or 0,
                'total_rework': overall['total_rework'] or 0,
                'total_rejection': overall['total_rejection'] or 0,
                'avg_yield': round(overall['avg_yield'] or 0, 2),
                'avg_ok_percentage': round(overall['avg_ok_percentage'] or 0, 2),
                'avg_rejection_percentage': round(overall['avg_rejection_percentage'] or 0, 2),
            },
            'top_rejections_by_order': list(rejection_by_order)
        })


class DepartmentPerformanceView(views.APIView):
    """Department-wise performance metrics."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        thirty_days_ago = today - timedelta(days=30)
        
        # Fabrication Performance
        fabrication_stats = OrderFabrication.objects.filter(
            created_at__date__gte=thirty_days_ago
        ).values('process__name').annotate(
            total_orders=Count('id'),
            completed=Count('id', filter=Q(status='completed')),
            in_progress=Count('id', filter=Q(status='in_progress')),
            avg_completion=Avg(
                F('completed_quantity') * 100.0 / F('planned_quantity'),
                filter=Q(planned_quantity__gt=0)
            )
        )
        
        # Inspection Performance
        inspection_stats = OrderInspection.objects.filter(
            created_at__date__gte=thirty_days_ago
        ).aggregate(
            total_inspections=Count('id'),
            passed=Count('id', filter=Q(result='pass')),
            failed=Count('id', filter=Q(result='fail')),
            pending_approval=Count('id', filter=Q(is_qa_approved=False)),
            avg_pass_rate=Avg(
                F('passed_quantity') * 100.0 / F('inspected_quantity'),
                filter=Q(inspected_quantity__gt=0)
            )
        )
        
        # Logistics Performance
        dispatch_stats = OrderDispatch.objects.filter(
            created_at__date__gte=thirty_days_ago
        ).aggregate(
            total_dispatches=Count('id'),
            dispatched=Count('id', filter=Q(status='dispatched')),
            delivered=Count('id', filter=Q(status='delivered')),
            pending=Count('id', filter=Q(status__in=['pending', 'packing', 'packed', 'ready'])),
            delayed=Count(
                'id',
                filter=Q(planned_dispatch_date__lt=today) & ~Q(status__in=['dispatched', 'in_transit', 'delivered'])
            )
        )
        
        return Response({
            'fabrication': list(fabrication_stats),
            'inspection': inspection_stats,
            'logistics': dispatch_stats
        })


class CustomerSummaryView(views.APIView):
    """Customer-wise order summary."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Top customers by order value
        top_customers_value = Customer.objects.annotate(
            total_orders=Count('orders'),
            total_value=Sum('orders__total_amount'),
            active_orders=Count(
                'orders',
                filter=~Q(orders__status__in=['completed', 'cancelled'])
            )
        ).filter(total_orders__gt=0).order_by('-total_value')[:10]
        
        result = []
        for customer in top_customers_value:
            result.append({
                'id': str(customer.id),
                'name': customer.company_name,
                'total_orders': customer.total_orders,
                'total_value': float(customer.total_value or 0),
                'active_orders': customer.active_orders,
            })
        
        # Customer type distribution
        type_distribution = Customer.objects.filter(is_active=True).values(
            'customer_type'
        ).annotate(count=Count('id'))
        
        return Response({
            'top_customers': result,
            'type_distribution': list(type_distribution)
        })


class MonthlyTrendsView(views.APIView):
    """Monthly trends for orders and revenue."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        months = int(request.query_params.get('months', 12))
        
        # Calculate start date
        today = timezone.now().date()
        start_date = today - timedelta(days=months * 30)
        
        # Monthly order trends
        monthly_orders = Order.objects.filter(
            created_at__date__gte=start_date
        ).annotate(
            month=TruncMonth('created_at')
        ).values('month').annotate(
            total_orders=Count('id'),
            total_value=Sum('total_amount'),
            completed=Count('id', filter=Q(status='completed')),
            cancelled=Count('id', filter=Q(status='cancelled'))
        ).order_by('month')
        
        # Monthly production
        monthly_production = ProductionRecord.objects.filter(
            production_date__gte=start_date
        ).annotate(
            month=TruncMonth('production_date')
        ).values('month').annotate(
            total_produced=Sum('produced_quantity'),
            total_ok=Sum('ok_quantity'),
            total_rejection=Sum('rejection_quantity'),
            avg_yield=Avg('total_yield_percentage')
        ).order_by('month')
        
        # Monthly dispatch
        monthly_dispatch = OrderDispatch.objects.filter(
            created_at__date__gte=start_date
        ).annotate(
            month=TruncMonth('created_at')
        ).values('month').annotate(
            total_dispatched=Count('id', filter=Q(status='dispatched')),
            total_delivered=Count('id', filter=Q(status='delivered'))
        ).order_by('month')
        
        return Response({
            'orders': list(monthly_orders),
            'production': list(monthly_production),
            'dispatch': list(monthly_dispatch)
        })


class WeeklyProductionView(views.APIView):
    """Weekly production summary."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        weeks = int(request.query_params.get('weeks', 8))
        start_date = timezone.now().date() - timedelta(weeks=weeks)
        
        weekly_data = ProductionRecord.objects.filter(
            production_date__gte=start_date
        ).annotate(
            week=TruncWeek('production_date')
        ).values('week').annotate(
            total_produced=Sum('produced_quantity'),
            total_ok=Sum('ok_quantity'),
            total_rework=Sum('rework_quantity'),
            total_rejection=Sum('rejection_quantity'),
            avg_yield=Avg('total_yield_percentage'),
            record_count=Count('id')
        ).order_by('week')
        
        return Response({
            'weeks': weeks,
            'data': list(weekly_data)
        })


class RealTimeStatusView(views.APIView):
    """Real-time status of ongoing activities."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        
        # Today's production
        today_production = ProductionRecord.objects.filter(
            production_date=today
        ).aggregate(
            total_produced=Sum('produced_quantity'),
            total_ok=Sum('ok_quantity'),
            total_rejection=Sum('rejection_quantity')
        )
        
        # In-progress fabrications
        active_fabrications = OrderFabrication.objects.filter(
            status='in_progress'
        ).select_related('order', 'process').values(
            'order__quote_number', 'process__name', 'completed_quantity', 'planned_quantity'
        )[:10]
        
        # Pending inspections
        pending_inspections = OrderInspection.objects.filter(
            result='pending'
        ).select_related('order', 'inspection_type').values(
            'order__quote_number', 'inspection_type__name'
        )[:10]
        
        # Ready for dispatch
        ready_dispatch = OrderDispatch.objects.filter(
            status__in=['packed', 'ready']
        ).select_related('order').values(
            'order__quote_number', 'order__project_name', 'planned_dispatch_date'
        )[:10]
        
        # Pending QA approvals
        pending_qa = OrderInspection.objects.filter(
            is_qa_approved=False,
            result__in=['pass', 'conditional']
        ).select_related('order').values(
            'order__quote_number', 'inspection_type__name', 'inspected_at'
        )[:10]
        
        return Response({
            'today_production': {
                'total_produced': today_production['total_produced'] or 0,
                'total_ok': today_production['total_ok'] or 0,
                'total_rejection': today_production['total_rejection'] or 0,
            },
            'active_fabrications': list(active_fabrications),
            'pending_inspections': list(pending_inspections),
            'ready_for_dispatch': list(ready_dispatch),
            'pending_qa_approvals': list(pending_qa)
        })