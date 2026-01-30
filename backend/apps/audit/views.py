"""
Views for Audit app.
"""

from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count
from django.utils import timezone
from datetime import timedelta
from .models import AuditLog, UserActivity
from .serializers import AuditLogSerializer, UserActivitySerializer
from apps.accounts.permissions import IsAdmin


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing audit logs."""
    
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['user', 'action', 'model_name']
    search_fields = ['user_email', 'object_repr', 'notes']
    ordering_fields = ['created_at', 'action']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = AuditLog.objects.select_related('user', 'content_type')
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)
        
        return queryset

    @action(detail=False, methods=['get'])
    def by_user(self, request):
        """Get audit logs grouped by user."""
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response(
                {'detail': 'user_id parameter is required.'},
                status=400
            )
        
        logs = AuditLog.objects.filter(user_id=user_id).order_by('-created_at')[:100]
        serializer = AuditLogSerializer(logs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_model(self, request):
        """Get audit logs for a specific model."""
        model_name = request.query_params.get('model_name')
        if not model_name:
            return Response(
                {'detail': 'model_name parameter is required.'},
                status=400
            )
        
        logs = AuditLog.objects.filter(model_name=model_name).order_by('-created_at')[:100]
        serializer = AuditLogSerializer(logs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_object(self, request):
        """Get audit logs for a specific object."""
        object_id = request.query_params.get('object_id')
        if not object_id:
            return Response(
                {'detail': 'object_id parameter is required.'},
                status=400
            )
        
        logs = AuditLog.objects.filter(object_id=object_id).order_by('-created_at')
        serializer = AuditLogSerializer(logs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get audit log statistics."""
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now() - timedelta(days=days)
        
        # Actions by type
        actions_by_type = AuditLog.objects.filter(
            created_at__gte=start_date
        ).values('action').annotate(count=Count('id'))
        
        # Actions by model
        actions_by_model = AuditLog.objects.filter(
            created_at__gte=start_date
        ).values('model_name').annotate(count=Count('id'))
        
        # Most active users
        active_users = AuditLog.objects.filter(
            created_at__gte=start_date
        ).values('user__email', 'user__first_name', 'user__last_name').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        return Response({
            'period_days': days,
            'actions_by_type': list(actions_by_type),
            'actions_by_model': list(actions_by_model),
            'most_active_users': list(active_users)
        })


class UserActivityViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing user activities."""
    
    queryset = UserActivity.objects.all()
    serializer_class = UserActivitySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['user', 'activity_type']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return UserActivity.objects.all()
        return UserActivity.objects.filter(user=user)

    @action(detail=False, methods=['get'])
    def my_activity(self, request):
        """Get current user's activity."""
        activities = UserActivity.objects.filter(user=request.user).order_by('-created_at')[:50]
        serializer = UserActivitySerializer(activities, many=True)
        return Response(serializer.data)