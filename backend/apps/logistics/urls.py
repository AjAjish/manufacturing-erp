"""
URL patterns for Logistics app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PackingStandardViewSet, OrderDispatchViewSet

router = DefaultRouter()
router.register(r'packing-standards', PackingStandardViewSet, basename='packing-standard')
router.register(r'dispatches', OrderDispatchViewSet, basename='dispatch')

urlpatterns = [
    path('', include(router.urls)),
]