"""
Views for Logistics app.
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import PackingStandard, OrderDispatch, DispatchDocument
from .serializers import (
    PackingStandardSerializer,
    OrderDispatchSerializer,
    OrderDispatchCreateSerializer,
    OrderDispatchUpdateSerializer,
    DispatchDocumentSerializer,
    DispatchActionSerializer
)
from apps.accounts.permissions import IsLogistics
from apps.crm.models import Order


class PackingStandardViewSet(viewsets.ModelViewSet):
    """ViewSet for managing packing standards."""
    
    queryset = PackingStandard.objects.all()
    serializer_class = PackingStandardSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class OrderDispatchViewSet(viewsets.ModelViewSet):
    """ViewSet for managing order dispatches."""
    
    queryset = OrderDispatch.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'transport_mode', 'packing_standard']
    search_fields = [
        'order__quote_number', 'order__project_name',
        'transporter_name', 'tracking_number', 'invoice_number'
    ]
    ordering_fields = ['planned_dispatch_date', 'actual_dispatch_date', 'created_at', 'status']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderDispatchCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return OrderDispatchUpdateSerializer
        return OrderDispatchSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'start_packing', 'mark_packed', 'dispatch', 'mark_delivered']:
            return [IsAuthenticated(), IsLogistics()]
        return [IsAuthenticated()]

    @action(detail=True, methods=['post'])
    def start_packing(self, request, pk=None):
        """Start packing process."""
        dispatch = self.get_object()
        
        if dispatch.status != OrderDispatch.DispatchStatus.PENDING:
            return Response(
                {'detail': 'Packing can only be started from Pending status.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        dispatch.status = OrderDispatch.DispatchStatus.PACKING
        dispatch.packed_by = request.user
        dispatch.save()
        
        return Response(OrderDispatchSerializer(dispatch, context={'request': request}).data)

    @action(detail=True, methods=['post'])
    def mark_packed(self, request, pk=None):
        """Mark order as packed."""
        dispatch = self.get_object()
        
        if dispatch.status != OrderDispatch.DispatchStatus.PACKING:
            return Response(
                {'detail': 'Order must be in Packing status.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update packing details from request
        for field in ['total_packages', 'gross_weight', 'net_weight', 'dimensions', 'packing_details']:
            if field in request.data:
                setattr(dispatch, field, request.data[field])
        
        dispatch.status = OrderDispatch.DispatchStatus.PACKED
        dispatch.save()
        
        return Response(OrderDispatchSerializer(dispatch, context={'request': request}).data)

    @action(detail=True, methods=['post'])
    def ready_for_dispatch(self, request, pk=None):
        """Mark order as ready for dispatch."""
        dispatch = self.get_object()
        
        if dispatch.status != OrderDispatch.DispatchStatus.PACKED:
            return Response(
                {'detail': 'Order must be Packed first.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if QA approved
        if not dispatch.can_dispatch:
            return Response(
                {'detail': 'Cannot dispatch - QA approval pending.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        dispatch.status = OrderDispatch.DispatchStatus.READY
        dispatch.save()
        
        return Response(OrderDispatchSerializer(dispatch, context={'request': request}).data)

    @action(detail=True, methods=['post'])
    def dispatch(self, request, pk=None):
        """Dispatch the order."""
        dispatch = self.get_object()
        
        if dispatch.status not in [OrderDispatch.DispatchStatus.PACKED, OrderDispatch.DispatchStatus.READY]:
            return Response(
                {'detail': 'Order must be Packed or Ready for Dispatch.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if QA approved
        if not dispatch.can_dispatch:
            return Response(
                {'detail': 'Cannot dispatch - QA approval pending.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update transport details
        for field in ['transporter_name', 'vehicle_number', 'driver_name', 'driver_phone', 'tracking_number', 'lr_number']:
            if field in request.data:
                setattr(dispatch, field, request.data[field])
        
        dispatch.status = OrderDispatch.DispatchStatus.DISPATCHED
        dispatch.actual_dispatch_date = timezone.now().date()
        dispatch.dispatched_at = timezone.now()
        dispatch.dispatched_by = request.user
        dispatch.save()
        
        # Update order status
        order = dispatch.order
        order.status = Order.Status.DISPATCHED
        order.save()
        
        return Response(OrderDispatchSerializer(dispatch, context={'request': request}).data)

    @action(detail=True, methods=['post'])
    def mark_in_transit(self, request, pk=None):
        """Mark as in transit."""
        dispatch = self.get_object()
        
        if dispatch.status != OrderDispatch.DispatchStatus.DISPATCHED:
            return Response(
                {'detail': 'Order must be Dispatched first.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        dispatch.status = OrderDispatch.DispatchStatus.IN_TRANSIT
        if 'tracking_number' in request.data:
            dispatch.tracking_number = request.data['tracking_number']
        dispatch.save()
        
        return Response(OrderDispatchSerializer(dispatch, context={'request': request}).data)

    @action(detail=True, methods=['post'])
    def mark_delivered(self, request, pk=None):
        """Mark order as delivered."""
        dispatch = self.get_object()
        
        if dispatch.status not in [OrderDispatch.DispatchStatus.DISPATCHED, OrderDispatch.DispatchStatus.IN_TRANSIT]:
            return Response(
                {'detail': 'Order must be Dispatched or In Transit.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        dispatch.status = OrderDispatch.DispatchStatus.DELIVERED
        dispatch.actual_delivery_date = timezone.now().date()
        dispatch.delivered_at = timezone.now()
        dispatch.save()
        
        # Update order status
        order = dispatch.order
        order.status = Order.Status.COMPLETED
        order.actual_delivery_date = dispatch.actual_delivery_date
        order.save()
        
        return Response(OrderDispatchSerializer(dispatch, context={'request': request}).data)

    @action(detail=False, methods=['get'])
    def by_order(self, request):
        """Get dispatch details for a specific order."""
        order_id = request.query_params.get('order_id')
        if not order_id:
            return Response(
                {'detail': 'order_id parameter is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            dispatch = OrderDispatch.objects.get(order_id=order_id)
            serializer = OrderDispatchSerializer(dispatch, context={'request': request})
            return Response(serializer.data)
        except OrderDispatch.DoesNotExist:
            return Response(
                {'detail': 'No dispatch record found for this order.'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def pending_dispatch(self, request):
        """Get orders pending dispatch."""
        dispatches = OrderDispatch.objects.filter(
            status__in=[
                OrderDispatch.DispatchStatus.PENDING,
                OrderDispatch.DispatchStatus.PACKING,
                OrderDispatch.DispatchStatus.PACKED,
                OrderDispatch.DispatchStatus.READY
            ]
        ).select_related('order', 'packing_standard')
        
        serializer = OrderDispatchSerializer(dispatches, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def in_transit(self, request):
        """Get orders in transit."""
        dispatches = OrderDispatch.objects.filter(
            status__in=[
                OrderDispatch.DispatchStatus.DISPATCHED,
                OrderDispatch.DispatchStatus.IN_TRANSIT
            ]
        ).select_related('order')
        
        serializer = OrderDispatchSerializer(dispatches, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def delayed(self, request):
        """Get delayed dispatches."""
        today = timezone.now().date()
        dispatches = OrderDispatch.objects.filter(
            planned_dispatch_date__lt=today
        ).exclude(
            status__in=[
                OrderDispatch.DispatchStatus.DISPATCHED,
                OrderDispatch.DispatchStatus.IN_TRANSIT,
                OrderDispatch.DispatchStatus.DELIVERED
            ]
        ).select_related('order')
        
        serializer = OrderDispatchSerializer(dispatches, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_document(self, request, pk=None):
        """Upload a document for dispatch."""
        dispatch = self.get_object()
        
        serializer = DispatchDocumentSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save(dispatch=dispatch, uploaded_by=request.user)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def documents(self, request, pk=None):
        """Get all documents for a dispatch."""
        dispatch = self.get_object()
        documents = dispatch.documents.all()
        serializer = DispatchDocumentSerializer(documents, many=True, context={'request': request})
        return Response(serializer.data)