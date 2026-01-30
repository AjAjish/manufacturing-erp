"""
URL patterns for Engineering app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DrawingViewSet

router = DefaultRouter()
router.register(r'drawings', DrawingViewSet, basename='drawing')

urlpatterns = [
    path('', include(router.urls)),
]