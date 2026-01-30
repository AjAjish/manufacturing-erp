"""
URL patterns for Production app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductionRecordViewSet, ProductionSummaryViewSet

router = DefaultRouter()
router.register(r'records', ProductionRecordViewSet, basename='production-record')
router.register(r'summaries', ProductionSummaryViewSet, basename='production-summary')

urlpatterns = [
    path('', include(router.urls)),
]