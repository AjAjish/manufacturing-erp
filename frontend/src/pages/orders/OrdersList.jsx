import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { orderService } from '../../services/api';
import Card from '../../components/common/Card';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.search) params.search = filters.search;
      
      const response = await orderService.getAll(params);
      setOrders(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'quote_number', label: 'Quote #' },
    { key: 'customer_name', label: 'Customer' },
    { key: 'project_name', label: 'Project' },
    { key: 'ordered_quantity', label: 'Qty' },
    {
      key: 'status',
      label: 'Status',
      render: (value, row) => <StatusBadge status={value} label={row.status_display} />,
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (value, row) => <StatusBadge status={value} label={row.priority_display} />,
    },
    {
      key: 'status_percentage',
      label: 'Progress',
      render: (value) => (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-primary-600 h-2.5 rounded-full"
            style={{ width: `${value}%` }}
          ></div>
        </div>
      ),
    },
    { key: 'expected_delivery_date', label: 'Delivery Date' },
  ];

  const canCreate = user?.is_admin || user?.role === 'sales';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="mt-1 text-sm text-gray-500">Manage all manufacturing orders</p>
        </div>
        {canCreate && (
          <Link to="/orders/new" className="btn-primary">
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            New Order
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label className="label">Search</label>
            <input
              type="text"
              className="input"
              placeholder="Search orders..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="quoted">Quoted</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_production">In Production</option>
              <option value="quality_check">Quality Check</option>
              <option value="ready_for_dispatch">Ready for Dispatch</option>
              <option value="dispatched">Dispatched</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="label">Priority</label>
            <select
              className="input"
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: '', priority: '', search: '' })}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card>
        <DataTable
          columns={columns}
          data={orders}
          loading={loading}
          emptyMessage="No orders found"
          onRowClick={(row) => navigate(`/orders/${row.id}`)}
        />
      </Card>
    </div>
  );
}