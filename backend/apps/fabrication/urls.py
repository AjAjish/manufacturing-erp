"""
URL patterns for Fabrication app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FabricationProcessViewSet, OrderFabricationViewSet, FabricationLogViewSet

router = DefaultRouter()
router.register(r'processes', FabricationProcessViewSet, basename='fabrication-process')
router.register(r'order-fabrications', OrderFabricationViewSet, basename='order-fabrication')
router.register(r'logs', FabricationLogViewSet, basename='fabrication-log')

urlpatterns = [
    path('', include(router.urls)),
]