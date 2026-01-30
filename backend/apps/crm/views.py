"""
Views for CRM app.
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Q
from .models import Customer, Order, OrderStatusHistory
from .serializers import (
    CustomerListSerializer,
    CustomerDetailSerializer,
    CustomerCreateUpdateSerializer,
    OrderListSerializer,
    OrderDetailSerializer,
    OrderCreateSerializer,
    OrderUpdateSerializer,
    OrderStatusUpdateSerializer,
    OrderStatusHistorySerializer
)
from apps.accounts.permissions import IsSales, IsAdminOrReadOnly


class CustomerViewSet(viewsets.ModelViewSet):
    """ViewSet for managing customers."""
    
    queryset = Customer.objects.all()
    permission_classes = [IsAuthenticated, IsSales]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['customer_type', 'is_active', 'city', 'state', 'country']
    search_fields = ['name', 'company_name', 'email', 'phone', 'gst_number']
    ordering_fields = ['company_name', 'created_at', 'customer_type']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return CustomerListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return CustomerCreateUpdateSerializer
        return CustomerDetailSerializer

    def get_queryset(self):
        queryset = Customer.objects.annotate(
            total_orders_count=Count('orders'),
            active_orders_count=Count(
                'orders',
                filter=~Q(orders__status__in=['completed', 'cancelled'])
            )
        )
        return queryset

    @action(detail=True, methods=['get'])
    def orders(self, request, pk=None):
        """Get all orders for a specific customer."""
        customer = self.get_object()
        orders = customer.orders.all()
        serializer = OrderListSerializer(orders, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle customer active status."""
        customer = self.get_object()
        customer.is_active = not customer.is_active
        customer.save()
        return Response(CustomerDetailSerializer(customer).data)


class OrderViewSet(viewsets.ModelViewSet):
    """ViewSet for managing orders."""
    
    queryset = Order.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'customer']
    search_fields = ['quote_number', 'po_number', 'work_order_number', 'project_name']
    ordering_fields = ['created_at', 'expected_delivery_date', 'status', 'priority']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return OrderListSerializer
        elif self.action == 'create':
            return OrderCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return OrderUpdateSerializer
        elif self.action == 'update_status':
            return OrderStatusUpdateSerializer
        return OrderDetailSerializer

    def get_queryset(self):
        queryset = Order.objects.select_related('customer', 'created_by', 'assigned_to')
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)
        
        # Filter delayed orders
        delayed = self.request.query_params.get('delayed')
        if delayed == 'true':
            from django.utils import timezone
            queryset = queryset.filter(
                expected_delivery_date__lt=timezone.now().date()
            ).exclude(
                status__in=[Order.Status.COMPLETED, Order.Status.CANCELLED, Order.Status.DISPATCHED]
            )
        
        return queryset

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update order status with history tracking."""
        order = self.get_object()
        serializer = OrderStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        previous_status = order.status
        new_status = serializer.validated_data['status']
        notes = serializer.validated_data.get('notes', '')
        
        # Update order status
        order.status = new_status
        order.save()
        
        # Create status history
        OrderStatusHistory.objects.create(
            order=order,
            previous_status=previous_status,
            new_status=new_status,
            changed_by=request.user,
            notes=notes
        )
        
        return Response(OrderDetailSerializer(order).data)

    @action(detail=True, methods=['get'])
    def status_history(self, request, pk=None):
        """Get status history for an order."""
        order = self.get_object()
        history = order.status_history.all()
        serializer = OrderStatusHistorySerializer(history, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def delayed(self, request):
        """Get all delayed orders."""
        from django.utils import timezone
        delayed_orders = Order.objects.filter(
            expected_delivery_date__lt=timezone.now().date()
        ).exclude(
            status__in=[Order.Status.COMPLETED, Order.Status.CANCELLED, Order.Status.DISPATCHED]
        )
        serializer = OrderListSerializer(delayed_orders, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_status(self, request):
        """Get order counts by status."""
        status_counts = Order.objects.values('status').annotate(count=Count('id'))
        return Response(status_counts)

    @action(detail=False, methods=['get'])
    def my_orders(self, request):
        """Get orders assigned to current user."""
        orders = Order.objects.filter(assigned_to=request.user)
        serializer = OrderListSerializer(orders, many=True)
        return Response(serializer.data)