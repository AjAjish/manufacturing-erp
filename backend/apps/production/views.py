"""
Views for Production app.
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Sum, Avg
from .models import ProductionRecord, ProductionSummary
from .serializers import (
    ProductionRecordSerializer,
    ProductionRecordCreateSerializer,
    ProductionRecordUpdateSerializer,
    ProductionSummarySerializer
)
from apps.accounts.permissions import IsProduction


class ProductionRecordViewSet(viewsets.ModelViewSet):
    """ViewSet for managing production records."""
    
    queryset = ProductionRecord.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['order', 'production_date', 'shift', 'recorded_by']
    search_fields = ['order__quote_number', 'order__project_name']
    ordering_fields = ['production_date', 'created_at', 'ok_percentage']
    ordering = ['-production_date', '-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return ProductionRecordCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ProductionRecordUpdateSerializer
        return ProductionRecordSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'verify']:
            return [IsAuthenticated(), IsProduction()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        record = serializer.save()
        # Update or create production summary
        summary, created = ProductionSummary.objects.get_or_create(order=record.order)
        summary.update_from_records()

    def perform_update(self, serializer):
        record = serializer.save()
        # Update production summary
        if hasattr(record.order, 'production_summary'):
            record.order.production_summary.update_from_records()

    def perform_destroy(self, instance):
        order = instance.order
        instance.delete()
        # Update production summary
        if hasattr(order, 'production_summary'):
            order.production_summary.update_from_records()

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """Verify a production record."""
        record = self.get_object()
        record.verified_by = request.user
        record.verified_at = timezone.now()
        record.save()
        return Response(ProductionRecordSerializer(record).data)

    @action(detail=False, methods=['get'])
    def by_order(self, request):
        """Get all production records for a specific order."""
        order_id = request.query_params.get('order_id')
        if not order_id:
            return Response(
                {'detail': 'order_id parameter is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        records = ProductionRecord.objects.filter(order_id=order_id)
        serializer = ProductionRecordSerializer(records, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def daily_summary(self, request):
        """Get daily production summary."""
        date = request.query_params.get('date', timezone.now().date())
        
        records = ProductionRecord.objects.filter(production_date=date)
        summary = records.aggregate(
            total_planned=Sum('planned_quantity'),
            total_produced=Sum('produced_quantity'),
            total_ok=Sum('ok_quantity'),
            total_rework=Sum('rework_quantity'),
            total_rejection=Sum('rejection_quantity'),
            avg_ok_percentage=Avg('ok_percentage'),
            avg_yield_percentage=Avg('total_yield_percentage')
        )
        
        return Response({
            'date': date,
            'record_count': records.count(),
            **summary
        })

    @action(detail=False, methods=['get'])
    def yield_analysis(self, request):
        """Get yield analysis for date range."""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        queryset = ProductionRecord.objects.all()
        
        if start_date:
            queryset = queryset.filter(production_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(production_date__lte=end_date)
        
        analysis = queryset.values('production_date').annotate(
            total_produced=Sum('produced_quantity'),
            total_ok=Sum('ok_quantity'),
            total_rework=Sum('rework_quantity'),
            total_rejection=Sum('rejection_quantity'),
            avg_yield=Avg('total_yield_percentage')
        ).order_by('production_date')
        
        return Response(list(analysis))


class ProductionSummaryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing production summaries."""
    
    queryset = ProductionSummary.objects.all()
    serializer_class = ProductionSummarySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['order']
    ordering_fields = ['completion_percentage', 'overall_yield_percentage', 'last_updated']
    ordering = ['-last_updated']

    @action(detail=False, methods=['get'])
    def by_order(self, request):
        """Get production summary for a specific order."""
        order_id = request.query_params.get('order_id')
        if not order_id:
            return Response(
                {'detail': 'order_id parameter is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            summary = ProductionSummary.objects.get(order_id=order_id)
            serializer = ProductionSummarySerializer(summary)
            return Response(serializer.data)
        except ProductionSummary.DoesNotExist:
            return Response(
                {'detail': 'No production summary found for this order.'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def low_yield(self, request):
        """Get orders with low yield (below threshold)."""
        threshold = request.query_params.get('threshold', 90)
        
        summaries = ProductionSummary.objects.filter(
            overall_yield_percentage__lt=threshold,
            total_produced__gt=0
        ).order_by('overall_yield_percentage')
        
        serializer = ProductionSummarySerializer(summaries, many=True)
        return Response(serializer.data)