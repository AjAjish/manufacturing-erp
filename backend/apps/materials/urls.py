"""
URL patterns for Materials app.
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
router.register(r'materials', MaterialViewSet, basename='material')
router.register(r'order-materials', OrderMaterialViewSet, basename='order-material')
router.register(r'transactions', MaterialTransactionViewSet, basename='material-transaction')

urlpatterns = [
    path('', include(router.urls)),
]