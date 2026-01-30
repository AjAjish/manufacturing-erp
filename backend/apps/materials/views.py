"""
Views for Materials app.
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, F
from django.utils import timezone
from .models import MaterialType, Material, OrderMaterial, MaterialTransaction
from .serializers import (
    MaterialTypeSerializer,
    MaterialListSerializer,
    MaterialDetailSerializer,
    MaterialCreateUpdateSerializer,
    OrderMaterialSerializer,
    OrderMaterialCreateSerializer,
    MaterialIssueSerializer,
    MaterialTransactionSerializer,
    StockAdjustmentSerializer
)
from apps.accounts.permissions import IsAdmin


class MaterialTypeViewSet(viewsets.ModelViewSet):
    """ViewSet for managing material types."""
    
    queryset = MaterialType.objects.all()
    serializer_class = MaterialTypeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class MaterialViewSet(viewsets.ModelViewSet):
    """ViewSet for managing materials."""
    
    queryset = Material.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['material_type', 'grade', 'unit', 'is_active']
    search_fields = ['code', 'name', 'description', 'grade']
    ordering_fields = ['code', 'name', 'stock_quantity', 'created_at']
    ordering = ['code']

    def get_serializer_class(self):
        if self.action == 'list':
            return MaterialListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return MaterialCreateUpdateSerializer
        return MaterialDetailSerializer

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Get materials with low stock."""
        materials = Material.objects.filter(
            stock_quantity__lte=F('minimum_stock'),
            is_active=True
        )
        serializer = MaterialListSerializer(materials, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def adjust_stock(self, request, pk=None):
        """Adjust material stock."""
        material = self.get_object()
        serializer = StockAdjustmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        quantity = data['quantity']
        transaction_type = data['transaction_type']
        
        stock_before = material.stock_quantity
        
        if transaction_type == 'receipt':
            material.stock_quantity += quantity
        elif transaction_type == 'scrap':
            if quantity > material.stock_quantity:
                return Response(
                    {'detail': 'Scrap quantity cannot exceed current stock.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            material.stock_quantity -= quantity
        else:  # adjustment
            material.stock_quantity = quantity
        
        material.save()
        
        # Create transaction record
        MaterialTransaction.objects.create(
            material=material,
            transaction_type=transaction_type,
            quantity=quantity,
            stock_before=stock_before,
            stock_after=material.stock_quantity,
            reference_number=data.get('reference_number', ''),
            notes=data.get('notes', ''),
            created_by=request.user
        )
        
        return Response(MaterialDetailSerializer(material).data)

    @action(detail=True, methods=['get'])
    def transactions(self, request, pk=None):
        """Get transaction history for a material."""
        material = self.get_object()
        transactions = material.transactions.all()[:50]
        serializer = MaterialTransactionSerializer(transactions, many=True)
        return Response(serializer.data)


class OrderMaterialViewSet(viewsets.ModelViewSet):
    """ViewSet for managing order materials."""
    
    queryset = OrderMaterial.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['order', 'material', 'status']
    search_fields = ['order__quote_number', 'material__code', 'material__name']
    ordering_fields = ['created_at', 'required_quantity']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderMaterialCreateSerializer
        return OrderMaterialSerializer

    @action(detail=True, methods=['post'])
    def issue(self, request, pk=None):
        """Issue material for an order."""
        order_material = self.get_object()
        serializer = MaterialIssueSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            order_material.issue_material(
                quantity=serializer.validated_data['quantity'],
                user=request.user
            )
            
            # Create transaction record
            MaterialTransaction.objects.create(
                material=order_material.material,
                order=order_material.order,
                transaction_type=MaterialTransaction.TransactionType.ISSUE,
                quantity=serializer.validated_data['quantity'],
                stock_before=order_material.material.stock_quantity + serializer.validated_data['quantity'],
                stock_after=order_material.material.stock_quantity,
                notes=serializer.validated_data.get('notes', ''),
                created_by=request.user
            )
            
            return Response(OrderMaterialSerializer(order_material).data)
        except ValueError as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def by_order(self, request):
        """Get all materials for a specific order."""
        order_id = request.query_params.get('order_id')
        if not order_id:
            return Response(
                {'detail': 'order_id parameter is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        materials = OrderMaterial.objects.filter(order_id=order_id)
        serializer = OrderMaterialSerializer(materials, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def pending_issues(self, request):
        """Get order materials pending issue."""
        pending = OrderMaterial.objects.filter(
            status__in=[OrderMaterial.Status.PLANNED, OrderMaterial.Status.REQUESTED, OrderMaterial.Status.PARTIALLY_ISSUED]
        )
        serializer = OrderMaterialSerializer(pending, many=True)
        return Response(serializer.data)


class MaterialTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing material transactions."""
    
    queryset = MaterialTransaction.objects.all()
    serializer_class = MaterialTransactionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['material', 'order', 'transaction_type']
    ordering_fields = ['created_at']
    ordering = ['-created_at']