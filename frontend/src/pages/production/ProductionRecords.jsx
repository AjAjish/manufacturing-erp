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
import { productionService, dashboardService, orderService } from '../../services/api';
import Card from '../../components/common/Card';
import DataTable from '../../components/common/DataTable';
import StatsCard from '../../components/common/StatsCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import FormInput from '../../components/forms/FormInput';
import FormSelect from '../../components/forms/FormSelect';
import Alert from '../../components/common/Alert';
import toast from 'react-hot-toast';

export default function ProductionRecords() {
  const [records, setRecords] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);
  const [formData, setFormData] = useState({
    order: '',
    production_date: new Date().toISOString().split('T')[0],
    shift: 'general',
    planned_quantity: '',
    produced_quantity: '',
    ok_quantity: '',
    rework_quantity: '',
    rejection_quantity: '',
    remarks: '',
    rejection_reasons: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recordsRes, analyticsRes, ordersRes] = await Promise.all([
        productionService.getRecords(),
        dashboardService.getProductionAnalytics(30),
        orderService.getAll(),
      ]);
      setRecords(recordsRes.data.results || recordsRes.data);
      setAnalytics(analyticsRes.data);
      setOrders(ordersRes.data.results || ordersRes.data);
    } catch (error) {
      console.error('Failed to fetch production data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      await productionService.create(formData);
      setIsModalOpen(false);
      setFormData({
        order: '',
        production_date: new Date().toISOString().split('T')[0],
        shift: 'general',
        planned_quantity: '',
        produced_quantity: '',
        ok_quantity: '',
        rework_quantity: '',
        rejection_quantity: '',
        remarks: '',
        rejection_reasons: '',
      });
      toast.success('Production record created successfully');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create production record');
    } finally {
      setSaving(false);
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
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setError('');
        }}
        title="Add Production Record"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert variant="error">{error}</Alert>}

          <FormSelect
            label="Order"
            name="order"
            value={formData.order}
            onChange={handleInputChange}
            required
            options={[
              { value: '', label: 'Select order' },
              ...orders.map(order => ({
                value: order.id,
                label: `${order.quote_number} - ${order.customer_name}`
              }))
            ]}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Production Date"
              name="production_date"
              type="date"
              value={formData.production_date}
              onChange={handleInputChange}
              required
            />
            <FormSelect
              label="Shift"
              name="shift"
              value={formData.shift}
              onChange={handleInputChange}
              required
              options={[
                { value: 'general', label: 'General Shift' },
                { value: 'day', label: 'Day Shift' },
                { value: 'night', label: 'Night Shift' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Planned Quantity"
              name="planned_quantity"
              type="number"
              value={formData.planned_quantity}
              onChange={handleInputChange}
              placeholder="Planned quantity"
              min="0"
            />
            <FormInput
              label="Produced Quantity"
              name="produced_quantity"
              type="number"
              value={formData.produced_quantity}
              onChange={handleInputChange}
              placeholder="Produced quantity"
              required
              min="0"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormInput
              label="OK Quantity"
              name="ok_quantity"
              type="number"
              value={formData.ok_quantity}
              onChange={handleInputChange}
              placeholder="OK quantity"
              required
              min="0"
            />
            <FormInput
              label="Rework Quantity"
              name="rework_quantity"
              type="number"
              value={formData.rework_quantity}
              onChange={handleInputChange}
              placeholder="Rework quantity"
              min="0"
            />
            <FormInput
              label="Rejection Quantity"
              name="rejection_quantity"
              type="number"
              value={formData.rejection_quantity}
              onChange={handleInputChange}
              placeholder="Rejection quantity"
              min="0"
            />
          </div>

          <div>
            <label htmlFor="remarks" className="label">
              Remarks
            </label>
            <textarea
              id="remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              placeholder="Any remarks"
              rows={2}
              className="input"
            />
          </div>

          <div>
            <label htmlFor="rejection_reasons" className="label">
              Rejection Reasons
            </label>
            <textarea
              id="rejection_reasons"
              name="rejection_reasons"
              value={formData.rejection_reasons}
              onChange={handleInputChange}
              placeholder="Reasons for rejection"
              rows={2}
              className="input"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setError('');
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Creating...' : 'Create Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}