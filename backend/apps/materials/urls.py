"""
URL patterns for Inventory app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MaterialTypeViewSet,
    MaterialViewSet,
    OrderMaterialViewSet,
    MaterialTransactionViewSet
)

router = DefaultRouter()
router.register(r'types', MaterialTypeViewSet, basename='material-type')
router.register(r'inventory', MaterialViewSet, basename='material')
router.register(r'order-inventory', OrderMaterialViewSet, basename='order-material')
# Backward-compatible aliases for existing clients
router.register(r'materials', MaterialViewSet, basename='legacy-material')
router.register(r'order-materials', OrderMaterialViewSet, basename='legacy-order-material')
router.register(r'transactions', MaterialTransactionViewSet, basename='material-transaction')

urlpatterns = [
    path('', include(router.urls)),
]