"""
URL patterns for Audit app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AuditLogViewSet, UserActivityViewSet

router = DefaultRouter()
router.register(r'logs', AuditLogViewSet, basename='audit-log')
router.register(r'activities', UserActivityViewSet, basename='user-activity')

urlpatterns = [
    path('', include(router.urls)),
]