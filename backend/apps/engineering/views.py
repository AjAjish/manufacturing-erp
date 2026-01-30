"""
Views for Engineering app.
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Drawing, DrawingComment
from .serializers import (
    DrawingListSerializer,
    DrawingDetailSerializer,
    DrawingCreateSerializer,
    DrawingUpdateSerializer,
    DrawingNewVersionSerializer,
    DrawingCommentSerializer
)
from apps.accounts.permissions import IsEngineering, IsAdmin


class DrawingViewSet(viewsets.ModelViewSet):
    """ViewSet for managing drawings."""
    
    queryset = Drawing.objects.all()
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['order', 'drawing_type', 'status', 'is_latest', 'created_by']
    search_fields = ['drawing_number', 'title', 'description']
    ordering_fields = ['created_at', 'version', 'drawing_number']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return DrawingListSerializer
        elif self.action == 'create':
            return DrawingCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return DrawingUpdateSerializer
        elif self.action == 'new_version':
            return DrawingNewVersionSerializer
        return DrawingDetailSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'new_version', 'approve', 'reject']:
            return [IsAuthenticated(), IsEngineering()]
        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = Drawing.objects.select_related('order', 'created_by', 'approved_by')
        
        # Filter by order
        order_id = self.request.query_params.get('order_id')
        if order_id:
            queryset = queryset.filter(order_id=order_id)
        
        # Filter latest only
        latest_only = self.request.query_params.get('latest_only')
        if latest_only == 'true':
            queryset = queryset.filter(is_latest=True)
        
        return queryset

    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def new_version(self, request, pk=None):
        """Create a new version of an existing drawing."""
        drawing = self.get_object()
        serializer = DrawingNewVersionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        new_drawing = drawing.create_new_version(
            file=serializer.validated_data['file'],
            user=request.user,
            notes=serializer.validated_data.get('notes')
        )
        
        return Response(
            DrawingDetailSerializer(new_drawing, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a drawing."""
        drawing = self.get_object()
        
        if drawing.status != Drawing.Status.PENDING_REVIEW:
            return Response(
                {'detail': 'Drawing must be in pending review status to approve.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        drawing.status = Drawing.Status.APPROVED
        drawing.approved_by = request.user
        drawing.approved_at = timezone.now()
        drawing.save()
        
        return Response(DrawingDetailSerializer(drawing, context={'request': request}).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a drawing."""
        drawing = self.get_object()
        notes = request.data.get('notes', '')
        
        if drawing.status != Drawing.Status.PENDING_REVIEW:
            return Response(
                {'detail': 'Drawing must be in pending review status to reject.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        drawing.status = Drawing.Status.REJECTED
        drawing.notes = f"{drawing.notes or ''}\n\nRejection reason: {notes}".strip()
        drawing.save()
        
        return Response(DrawingDetailSerializer(drawing, context={'request': request}).data)

    @action(detail=True, methods=['post'])
    def submit_for_review(self, request, pk=None):
        """Submit drawing for review."""
        drawing = self.get_object()
        
        if drawing.status != Drawing.Status.DRAFT:
            return Response(
                {'detail': 'Only draft drawings can be submitted for review.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        drawing.status = Drawing.Status.PENDING_REVIEW
        drawing.save()
        
        return Response(DrawingDetailSerializer(drawing, context={'request': request}).data)

    @action(detail=True, methods=['get'])
    def versions(self, request, pk=None):
        """Get all versions of a drawing."""
        drawing = self.get_object()
        versions = Drawing.objects.filter(
            order=drawing.order,
            drawing_number=drawing.drawing_number
        ).order_by('-version')
        
        serializer = DrawingListSerializer(versions, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get', 'post'])
    def comments(self, request, pk=None):
        """Get or add comments on a drawing."""
        drawing = self.get_object()
        
        if request.method == 'GET':
            comments = drawing.comments.all()
            serializer = DrawingCommentSerializer(comments, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            serializer = DrawingCommentSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(drawing=drawing, user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def by_order(self, request):
        """Get all drawings for a specific order."""
        order_id = request.query_params.get('order_id')
        if not order_id:
            return Response(
                {'detail': 'order_id parameter is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        drawings = Drawing.objects.filter(order_id=order_id, is_latest=True)
        serializer = DrawingListSerializer(drawings, many=True, context={'request': request})
        return Response(serializer.data)