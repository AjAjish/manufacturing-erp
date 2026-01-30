"""
Views for Surface Treatment app.
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import TreatmentType, OrderSurfaceTreatment
from .serializers import (
    TreatmentTypeSerializer,
    OrderSurfaceTreatmentSerializer,
    OrderSurfaceTreatmentCreateSerializer,
    OrderSurfaceTreatmentUpdateSerializer
)
from apps.accounts.permissions import IsProduction


class TreatmentTypeViewSet(viewsets.ModelViewSet):
    """ViewSet for managing treatment types."""
    
    queryset = TreatmentType.objects.all()
    serializer_class = TreatmentTypeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class OrderSurfaceTreatmentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing order surface treatments."""
    
    queryset = OrderSurfaceTreatment.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['order', 'treatment_type', 'status', 'is_outsourced']
    search_fields = ['order__quote_number', 'treatment_type__name', 'vendor_name']
    ordering_fields = ['created_at', 'status']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderSurfaceTreatmentCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return OrderSurfaceTreatmentUpdateSerializer
        return OrderSurfaceTreatmentSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'start', 'complete']:
            return [IsAuthenticated(), IsProduction()]
        return [IsAuthenticated()]

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Start surface treatment process."""
        treatment = self.get_object()
        
        if treatment.status != OrderSurfaceTreatment.Status.PENDING:
            return Response(
                {'detail': 'Treatment can only be started from Pending status.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        treatment.status = OrderSurfaceTreatment.Status.IN_PROGRESS
        treatment.started_at = timezone.now()
        treatment.updated_by = request.user
        treatment.save()
        
        return Response(OrderSurfaceTreatmentSerializer(treatment).data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Complete surface treatment process."""
        treatment = self.get_object()
        completed_qty = request.data.get('completed_quantity', treatment.planned_quantity)
        rejected_qty = request.data.get('rejected_quantity', 0)
        
        if treatment.status != OrderSurfaceTreatment.Status.IN_PROGRESS:
            return Response(
                {'detail': 'Treatment must be In Progress to complete.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        treatment.status = OrderSurfaceTreatment.Status.COMPLETED
        treatment.completed_quantity = completed_qty
        treatment.rejected_quantity = rejected_qty
        treatment.completed_at = timezone.now()
        treatment.updated_by = request.user
        treatment.save()
        
        return Response(OrderSurfaceTreatmentSerializer(treatment).data)

    @action(detail=False, methods=['get'])
    def by_order(self, request):
        """Get all surface treatments for a specific order."""
        order_id = request.query_params.get('order_id')
        if not order_id:
            return Response(
                {'detail': 'order_id parameter is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        treatments = OrderSurfaceTreatment.objects.filter(order_id=order_id)
        serializer = OrderSurfaceTreatmentSerializer(treatments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get all pending surface treatments."""
        treatments = OrderSurfaceTreatment.objects.filter(
            status=OrderSurfaceTreatment.Status.PENDING
        ).select_related('order', 'treatment_type')
        
        serializer = OrderSurfaceTreatmentSerializer(treatments, many=True)
        return Response(serializer.data)