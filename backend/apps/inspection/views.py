"""
Views for Inspection app.
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Avg, Sum,Count
from .models import InspectionType, OrderInspection, InspectionChecklist
from .serializers import (
    InspectionTypeSerializer,
    OrderInspectionSerializer,
    OrderInspectionCreateSerializer,
    OrderInspectionUpdateSerializer,
    InspectionChecklistSerializer,
    QAApprovalSerializer
)
from apps.accounts.permissions import IsQuality


class InspectionTypeViewSet(viewsets.ModelViewSet):
    """ViewSet for managing inspection types."""
    
    queryset = InspectionType.objects.all()
    serializer_class = InspectionTypeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['stage', 'is_mandatory', 'is_active']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['stage', 'name', 'created_at']
    ordering = ['stage', 'name']


class OrderInspectionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing order inspections."""
    
    queryset = OrderInspection.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['order', 'inspection_type', 'result', 'is_qa_approved', 'inspected_by']
    search_fields = ['order__quote_number', 'inspection_type__name']
    ordering_fields = ['inspection_date', 'created_at', 'result']
    ordering = ['-inspection_date', '-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderInspectionCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return OrderInspectionUpdateSerializer
        return OrderInspectionSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'qa_approve']:
            return [IsAuthenticated(), IsQuality()]
        return [IsAuthenticated()]

    @action(detail=True, methods=['post'])
    def qa_approve(self, request, pk=None):
        """QA approval for inspection."""
        inspection = self.get_object()
        serializer = QAApprovalSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        approved = serializer.validated_data['approved']
        remarks = serializer.validated_data.get('remarks', '')
        
        inspection.is_qa_approved = approved
        inspection.qa_approved_by = request.user
        inspection.qa_approved_at = timezone.now()
        if remarks:
            inspection.qa_remarks = f"{inspection.qa_remarks or ''}\n\nQA Approval: {remarks}".strip()
        inspection.save()
        
        # Update order status if PDI approved
        if approved and inspection.inspection_type.stage == InspectionType.Stage.PDI:
            from apps.crm.models import Order
            order = inspection.order
            if order.status == Order.Status.QUALITY_CHECK:
                order.status = Order.Status.READY_FOR_DISPATCH
                order.save()
        
        return Response(OrderInspectionSerializer(inspection).data)

    @action(detail=False, methods=['get'])
    def by_order(self, request):
        """Get all inspections for a specific order."""
        order_id = request.query_params.get('order_id')
        if not order_id:
            return Response(
                {'detail': 'order_id parameter is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        inspections = OrderInspection.objects.filter(order_id=order_id)
        serializer = OrderInspectionSerializer(inspections, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def pending_approval(self, request):
        """Get inspections pending QA approval."""
        inspections = OrderInspection.objects.filter(
            is_qa_approved=False,
            result__in=[OrderInspection.Result.PASS, OrderInspection.Result.CONDITIONAL]
        ).select_related('order', 'inspection_type')
        
        serializer = OrderInspectionSerializer(inspections, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def failed_inspections(self, request):
        """Get failed inspections."""
        inspections = OrderInspection.objects.filter(
            result__in=[OrderInspection.Result.FAIL, OrderInspection.Result.REWORK]
        ).select_related('order', 'inspection_type')
        
        serializer = OrderInspectionSerializer(inspections, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def dispatch_blocked(self, request):
        """Get orders blocked from dispatch due to inspection."""
        from apps.crm.models import Order
        
        # Get orders in quality check that don't have approved PDI
        blocked_orders = Order.objects.filter(
            status=Order.Status.QUALITY_CHECK
        ).exclude(
            inspections__inspection_type__stage=InspectionType.Stage.PDI,
            inspections__is_qa_approved=True,
            inspections__result=OrderInspection.Result.PASS
        )
        
        from apps.crm.serializers import OrderListSerializer
        serializer = OrderListSerializer(blocked_orders, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def quality_metrics(self, request):
        """Get quality metrics for date range."""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        queryset = OrderInspection.objects.all()
        
        if start_date:
            queryset = queryset.filter(inspection_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(inspection_date__lte=end_date)
        
        metrics = queryset.aggregate(
            total_inspected=Sum('inspected_quantity'),
            total_passed=Sum('passed_quantity'),
            total_failed=Sum('failed_quantity'),
            total_rework=Sum('rework_quantity'),
            avg_pass_rate=Avg('passed_quantity') * 100 / Avg('inspected_quantity')
        )
        
        result_counts = queryset.values('result').annotate(count=Count('id'))
        
        return Response({
            'metrics': metrics,
            'result_distribution': list(result_counts)
        })

    @action(detail=True, methods=['get', 'post'])
    def checklist(self, request, pk=None):
        """Get or add checklist items for an inspection."""
        inspection = self.get_object()
        
        if request.method == 'GET':
            items = inspection.checklist_items.all()
            serializer = InspectionChecklistSerializer(items, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            data = request.data
            if isinstance(data, list):
                # Bulk create
                items = []
                for item_data in data:
                    item_data['inspection'] = inspection.id
                    serializer = InspectionChecklistSerializer(data=item_data)
                    serializer.is_valid(raise_exception=True)
                    items.append(serializer.save())
                return Response(
                    InspectionChecklistSerializer(items, many=True).data,
                    status=status.HTTP_201_CREATED
                )
            else:
                data['inspection'] = inspection.id
                serializer = InspectionChecklistSerializer(data=data)
                serializer.is_valid(raise_exception=True)
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)