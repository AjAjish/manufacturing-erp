import React, { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { productionService, dashboardService } from '../../services/api';
import Card from '../../components/common/Card';
import DataTable from '../../components/common/DataTable';
import StatsCard from '../../components/common/StatsCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function ProductionRecords() {
  const [records, setRecords] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recordsRes, analyticsRes] = await Promise.all([
        productionService.getRecords(),
        dashboardService.getProductionAnalytics(30),
      ]);
      setRecords(recordsRes.data.results || recordsRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Failed to fetch production data:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'order_quote_number', label: 'Order' },
    { key: 'production_date', label: 'Date' },
    { key: 'shift_display', label: 'Shift' },
    { key: 'produced_quantity', label: 'Produced' },
    { 
      key: 'ok_quantity', 
      label: 'OK',
      render: (v) => <span className="text-green-600 font-medium">{v}</span>
    },
    { 
      key: 'rework_quantity', 
      label: 'Rework',
      render: (v) => <span className="text-yellow-600 font-medium">{v}</span>
    },
    { 
      key: 'rejection_quantity', 
      label: 'Rejection',
      render: (v) => <span className="text-red-600 font-medium">{v}</span>
    },
    { 
      key: 'total_yield_percentage', 
      label: 'Yield %',
      render: (v) => (
        <span className={`font-medium ${v >= 90 ? 'text-green-600' : v >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
          {v}%
        </span>
      )
    },
    { key: 'recorded_by_name', label: 'Recorded By' },
  ];

  if (loading) {
    return <LoadingSpinner size="lg" className="py-12" />;
  }

  const chartData = analytics?.daily_trends?.slice(-14).map(item => ({
    date: new Date(item.production_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    ok: item.total_ok || 0,
    rework: item.total_rework || 0,
    rejection: item.total_rejection || 0,
  })) || [];

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Production</h1>
          <p className="mt-1 text-sm text-gray-500">Track production quantities and yield</p>
        </div>
        <button className="btn-primary">
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Add Record
        </button>
      </div>

      {/* Stats */}
      {analytics && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <StatsCard
            title="Total Produced (30d)"
            value={analytics.overall_statistics.total_produced.toLocaleString()}
            color="primary"
          />
          <StatsCard
            title="OK Quantity"
            value={analytics.overall_statistics.total_ok.toLocaleString()}
            color="green"
          />
          <StatsCard
            title="Rework"
            value={analytics.overall_statistics.total_rework.toLocaleString()}
            color="yellow"
          />
          <StatsCard
            title="Rejection"
            value={analytics.overall_statistics.total_rejection.toLocaleString()}
            color="red"
          />
          <StatsCard
            title="Avg. Yield"
            value={`${analytics.overall_statistics.avg_yield}%`}
            color="blue"
          />
        </div>
      )}

      {/* Chart */}
      <Card title="Production Trend (Last 14 Days)">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ok" name="OK" fill="#10b981" stackId="a" />
              <Bar dataKey="rework" name="Rework" fill="#f59e0b" stackId="a" />
              <Bar dataKey="rejection" name="Rejection" fill="#ef4444" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Records Table */}
      <Card title="Recent Production Records">
        <DataTable
          columns={columns}
          data={records}
          loading={loading}
          emptyMessage="No production records found"
        />
      </Card>
    </div>
  );
}