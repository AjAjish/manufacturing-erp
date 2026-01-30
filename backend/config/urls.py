"""
URL configuration for Manufacturing ERP project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# API Documentation Schema
schema_view = get_schema_view(
    openapi.Info(
        title="Manufacturing ERP API",
        default_version='v1',
        description="REST API for Manufacturing ERP System",
        terms_of_service="https://www.example.com/terms/",
        contact=openapi.Contact(email="support@example.com"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    
    # API Endpoints
    path('api/v1/accounts/', include('apps.accounts.urls')),
    path('api/v1/crm/', include('apps.crm.urls')),
    path('api/v1/engineering/', include('apps.engineering.urls')),
    path('api/v1/materials/', include('apps.materials.urls')),
    path('api/v1/production/', include('apps.production.urls')),
    path('api/v1/fabrication/', include('apps.fabrication.urls')),
    path('api/v1/surface-treatment/', include('apps.surface_treatment.urls')),
    path('api/v1/inspection/', include('apps.inspection.urls')),
    path('api/v1/logistics/', include('apps.logistics.urls')),
    path('api/v1/dashboards/', include('apps.dashboards.urls')),
    path('api/v1/audit/', include('apps.audit.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)