import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyRupeeIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { dashboardService } from '../services/api';
import StatsCard from '../components/common/StatsCard';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [realTimeData, setRealTimeData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewRes, realTimeRes] = await Promise.all([
        dashboardService.getOverview(),
        dashboardService.getRealTimeStatus(),
      ]);
      setData(overviewRes.data);
      setRealTimeData(realTimeRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const statusData = data?.status_distribution?.map((item) => ({
    name: item.status.replace(/_/g, ' '),
    value: item.count,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Orders"
          value={data?.orders?.total || 0}
          icon={ClipboardDocumentListIcon}
          color="primary"
        />
        <StatsCard
          title="Active Orders"
          value={data?.orders?.active || 0}
          icon={ClockIcon}
          color="blue"
        />
        <StatsCard
          title="Delayed Orders"
          value={data?.orders?.delayed || 0}
          icon={ExclamationTriangleIcon}
          color="red"
        />
        <StatsCard
          title="Total Customers"
          value={data?.customers?.total || 0}
          icon={UserGroupIcon}
          color="green"
        />
      </div>

      {/* Production Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Produced (30d)"
          value={data?.production?.total_produced?.toLocaleString() || 0}
          icon={CheckCircleIcon}
          color="green"
        />
        <StatsCard
          title="OK Quantity"
          value={data?.production?.total_ok?.toLocaleString() || 0}
          icon={CheckCircleIcon}
          color="green"
        />
        <StatsCard
          title="Rejections"
          value={data?.production?.total_rejection?.toLocaleString() || 0}
          icon={ExclamationTriangleIcon}
          color="red"
        />
        <StatsCard
          title="Avg. Yield"
          value={`${data?.production?.avg_yield || 0}%`}
          icon={CurrencyRupeeIcon}
          color="blue"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Order Status Distribution */}
        <Card title="Order Status Distribution">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Today's Production */}
        <Card title="Today's Production">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {realTimeData?.today_production?.total_ok || 0}
              </p>
              <p className="text-sm text-gray-600">OK</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {realTimeData?.today_production?.total_produced || 0}
              </p>
              <p className="text-sm text-gray-600">Total Produced</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">
                {realTimeData?.today_production?.total_rejection || 0}
              </p>
              <p className="text-sm text-gray-600">Rejections</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Active Activities */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Active Fabrications */}
        <Card
          title="Active Fabrications"
          actions={
            <Link to="/production" className="text-sm text-primary-600 hover:text-primary-800">
              View all →
            </Link>
          }
        >
          {realTimeData?.active_fabrications?.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {realTimeData.active_fabrications.slice(0, 5).map((fab, idx) => (
                <li key={idx} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{fab.order__quote_number}</p>
                    <p className="text-sm text-gray-500">{fab.process__name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {fab.completed_quantity} / {fab.planned_quantity}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-4">No active fabrications</p>
          )}
        </Card>

        {/* Ready for Dispatch */}
        <Card
          title="Ready for Dispatch"
          actions={
            <Link to="/logistics" className="text-sm text-primary-600 hover:text-primary-800">
              View all →
            </Link>
          }
        >
          {realTimeData?.ready_for_dispatch?.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {realTimeData.ready_for_dispatch.slice(0, 5).map((dispatch, idx) => (
                <li key={idx} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{dispatch.order__quote_number}</p>
                    <p className="text-sm text-gray-500">{dispatch.order__project_name}</p>
                  </div>
                  <p className="text-sm text-gray-500">{dispatch.planned_dispatch_date}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-4">No orders ready for dispatch</p>
          )}
        </Card>
      </div>

      {/* Pending QA Approvals */}
      <Card
        title="Pending QA Approvals"
        actions={
          <Link to="/inspection" className="text-sm text-primary-600 hover:text-primary-800">
            View all →
          </Link>
        }
      >
        {realTimeData?.pending_qa_approvals?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Inspection Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Inspected At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {realTimeData.pending_qa_approvals.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.order__quote_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.inspection_type__name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.inspected_at ? new Date(item.inspected_at).toLocaleString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No pending approvals</p>
        )}
      </Card>
    </div>
  );
}