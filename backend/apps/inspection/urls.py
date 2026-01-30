"""
URL patterns for Inspection app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InspectionTypeViewSet, OrderInspectionViewSet

router = DefaultRouter()
router.register(r'types', InspectionTypeViewSet, basename='inspection-type')
router.register(r'order-inspections', OrderInspectionViewSet, basename='order-inspection')

urlpatterns = [
    path('', include(router.urls)),
]