"""
URL patterns for Surface Treatment app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TreatmentTypeViewSet, OrderSurfaceTreatmentViewSet

router = DefaultRouter()
router.register(r'types', TreatmentTypeViewSet, basename='treatment-type')
router.register(r'order-treatments', OrderSurfaceTreatmentViewSet, basename='order-treatment')

urlpatterns = [
    path('', include(router.urls)),
]