"""
URL patterns for Dashboards app.
"""

from django.urls import path
from .views import (
    DashboardOverviewView,
    OrderStatusTrackingView,
    DelayedOrdersView,
    ProductionAnalyticsView,
    DepartmentPerformanceView,
    CustomerSummaryView,
    MonthlyTrendsView,
    WeeklyProductionView,
    RealTimeStatusView
)

urlpatterns = [
    path('overview/', DashboardOverviewView.as_view(), name='dashboard-overview'),
    path('order-tracking/', OrderStatusTrackingView.as_view(), name='order-tracking'),
    path('delayed-orders/', DelayedOrdersView.as_view(), name='delayed-orders'),
    path('production-analytics/', ProductionAnalyticsView.as_view(), name='production-analytics'),
    path('department-performance/', DepartmentPerformanceView.as_view(), name='department-performance'),
    path('customer-summary/', CustomerSummaryView.as_view(), name='customer-summary'),
    path('monthly-trends/', MonthlyTrendsView.as_view(), name='monthly-trends'),
    path('weekly-production/', WeeklyProductionView.as_view(), name='weekly-production'),
    path('real-time-status/', RealTimeStatusView.as_view(), name='real-time-status'),
]