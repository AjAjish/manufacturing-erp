"""
Views for Fabrication app.
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import FabricationProcess, OrderFabrication, FabricationLog
from .serializers import (
    FabricationProcessSerializer,
    OrderFabricationSerializer,
    OrderFabricationCreateSerializer,
    OrderFabricationUpdateSerializer,
    FabricationLogSerializer,
    BulkFabricationCreateSerializer
)
from apps.accounts.permissions import IsProduction
from apps.crm.models import Order


class FabricationProcessViewSet(viewsets.ModelViewSet):
    """ViewSet for managing fabrication processes."""
    
    queryset = FabricationProcess.objects.all()
    serializer_class = FabricationProcessSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_active']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['sequence_order', 'name', 'created_at']
    ordering = ['sequence_order']


class OrderFabricationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing order fabrications."""
    
    queryset = OrderFabrication.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['order', 'process', 'status', 'operator']
    search_fields = ['order__quote_number', 'process__name', 'machine']
    ordering_fields = ['process__sequence_order', 'created_at', 'status']
    ordering = ['process__sequence_order']

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderFabricationCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return OrderFabricationUpdateSerializer
        return OrderFabricationSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'start', 'complete']:
            return [IsAuthenticated(), IsProduction()]
        return [IsAuthenticated()]

    def perform_update(self, serializer):
        instance = self.get_object()
        previous_status = instance.status
        
        updated_instance = serializer.save(updated_by=self.request.user)
        
        # Create log if status changed
        if previous_status != updated_instance.status:
            FabricationLog.objects.create(
                order_fabrication=updated_instance,
                previous_status=previous_status,
                new_status=updated_instance.status,
                quantity_completed=updated_instance.completed_quantity,
                logged_by=self.request.user
            )

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Start a fabrication process."""
        fabrication = self.get_object()
        
        if fabrication.status not in [OrderFabrication.Status.NOT_STARTED, OrderFabrication.Status.PENDING]:
            return Response(
                {'detail': 'Process can only be started from Not Started or Pending status.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        previous_status = fabrication.status
        fabrication.status = OrderFabrication.Status.IN_PROGRESS
        fabrication.actual_start_date = timezone.now().date()
        fabrication.started_at = timezone.now()
        fabrication.updated_by = request.user
        fabrication.save()
        
        # Create log
        FabricationLog.objects.create(
            order_fabrication=fabrication,
            previous_status=previous_status,
            new_status=fabrication.status,
            notes='Process started',
            logged_by=request.user
        )
        
        return Response(OrderFabricationSerializer(fabrication).data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Complete a fabrication process."""
        fabrication = self.get_object()
        completed_qty = request.data.get('completed_quantity', fabrication.planned_quantity)
        notes = request.data.get('notes', '')
        
        if fabrication.status != OrderFabrication.Status.IN_PROGRESS:
            return Response(
                {'detail': 'Process must be In Progress to complete.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        previous_status = fabrication.status
        fabrication.status = OrderFabrication.Status.COMPLETED
        fabrication.completed_quantity = completed_qty
        fabrication.actual_end_date = timezone.now().date()
        fabrication.completed_at = timezone.now()
        fabrication.updated_by = request.user
        fabrication.save()
        
        # Create log
        FabricationLog.objects.create(
            order_fabrication=fabrication,
            previous_status=previous_status,
            new_status=fabrication.status,
            quantity_completed=completed_qty,
            notes=notes,
            logged_by=request.user
        )
        
        return Response(OrderFabricationSerializer(fabrication).data)

    @action(detail=True, methods=['post'])
    def hold(self, request, pk=None):
        """Put fabrication process on hold."""
        fabrication = self.get_object()
        notes = request.data.get('notes', '')
        
        previous_status = fabrication.status
        fabrication.status = OrderFabrication.Status.ON_HOLD
        fabrication.updated_by = request.user
        fabrication.remarks = f"{fabrication.remarks or ''}\n\nOn Hold: {notes}".strip()
        fabrication.save()
        
        FabricationLog.objects.create(
            order_fabrication=fabrication,
            previous_status=previous_status,
            new_status=fabrication.status,
            notes=f"Put on hold: {notes}",
            logged_by=request.user
        )
        
        return Response(OrderFabricationSerializer(fabrication).data)

    @action(detail=False, methods=['get'])
    def by_order(self, request):
        """Get all fabrication processes for a specific order."""
        order_id = request.query_params.get('order_id')
        if not order_id:
            return Response(
                {'detail': 'order_id parameter is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        fabrications = OrderFabrication.objects.filter(
            order_id=order_id
        ).select_related('process', 'operator')
        
        serializer = OrderFabricationSerializer(fabrications, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Bulk create fabrication processes for an order."""
        serializer = BulkFabricationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        order_id = serializer.validated_data['order_id']
        process_ids = serializer.validated_data['process_ids']
        planned_quantity = serializer.validated_data['planned_quantity']
        
        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response(
                {'detail': 'Order not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        created_fabrications = []
        for process_id in process_ids:
            try:
                process = FabricationProcess.objects.get(id=process_id)
                fabrication, created = OrderFabrication.objects.get_or_create(
                    order=order,
                    process=process,
                    defaults={
                        'planned_quantity': planned_quantity,
                        'created_by': request.user
                    }
                )
                if created:
                    created_fabrications.append(fabrication)
            except FabricationProcess.DoesNotExist:
                continue
        
        serializer = OrderFabricationSerializer(created_fabrications, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def in_progress(self, request):
        """Get all in-progress fabrication processes."""
        fabrications = OrderFabrication.objects.filter(
            status=OrderFabrication.Status.IN_PROGRESS
        ).select_related('order', 'process', 'operator')
        
        serializer = OrderFabricationSerializer(fabrications, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def delayed(self, request):
        """Get all delayed fabrication processes."""
        today = timezone.now().date()
        fabrications = OrderFabrication.objects.filter(
            planned_end_date__lt=today
        ).exclude(
            status__in=[OrderFabrication.Status.COMPLETED, OrderFabrication.Status.SKIPPED]
        ).select_related('order', 'process')
        
        serializer = OrderFabricationSerializer(fabrications, many=True)
        return Response(serializer.data)


class FabricationLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing fabrication logs."""
    
    queryset = FabricationLog.objects.all()
    serializer_class = FabricationLogSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['order_fabrication', 'new_status', 'logged_by']
    ordering_fields = ['created_at']
    ordering = ['-created_at']