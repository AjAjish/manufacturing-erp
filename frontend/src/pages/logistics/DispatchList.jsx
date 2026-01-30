import React, { useState, useEffect } from 'react';
import { TruckIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { logisticsService } from '../../services/api';
import Card from '../../components/common/Card';
import DataTable from '../../components/common/DataTable';
import StatsCard from '../../components/common/StatsCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function DispatchList() {
  const [dispatches, setDispatches] = useState([]);
  const [pendingDispatches, setPendingDispatches] = useState([]);
  const [inTransit, setInTransit] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allRes, pendingRes, transitRes] = await Promise.all([
        logisticsService.getAll(),
        logisticsService.getPendingDispatch(),
        logisticsService.getInTransit(),
      ]);
      setDispatches(allRes.data.results || allRes.data);
      setPendingDispatches(pendingRes.data);
      setInTransit(transitRes.data);
    } catch (error) {
      console.error('Failed to fetch dispatches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (dispatchId, action) => {
    try {
      switch (action) {
        case 'start_packing':
          await logisticsService.startPacking(dispatchId);
          toast.success('Packing started');
          break;
        case 'mark_packed':
          await logisticsService.markPacked(dispatchId, {});
          toast.success('Marked as packed');
          break;
        case 'dispatch':
          await logisticsService.dispatch(dispatchId, {});
          toast.success('Order dispatched');
          break;
        case 'delivered':
          await logisticsService.markDelivered(dispatchId);
          toast.success('Marked as delivered');
          break;
      }
      fetchData();
    } catch (error) {
      const message = error.response?.data?.detail || 'Action failed';
      toast.error(message);
    }
  };

  const columns = [
    { key: 'order_quote_number', label: 'Order' },
    { key: 'order_project_name', label: 'Project' },
    { key: 'customer_name', label: 'Customer' },
    {
      key: 'status',
      label: 'Status',
      render: (v, row) => <StatusBadge status={v} label={row.status_display} />
    },
    { key: 'transport_mode_display', label: 'Transport' },
    { key: 'planned_dispatch_date', label: 'Planned Date' },
    { key: 'actual_dispatch_date', label: 'Dispatched' },
    {
      key: 'can_dispatch',
      label: 'QA Status',
      render: (v) => v ? (
        <span className="badge badge-green">Approved</span>
      ) : (
        <span className="badge badge-yellow">Pending</span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => {
        const actions = [];
        if (row.status === 'pending') {
          actions.push(
            <button key="start" onClick={() => handleAction(row.id, 'start_packing')} className="text-primary-600 hover:underline text-sm">
              Start Packing
            </button>
          );
        }
        if (row.status === 'packing') {
          actions.push(
            <button key="packed" onClick={() => handleAction(row.id, 'mark_packed')} className="text-primary-600 hover:underline text-sm">
              Mark Packed
            </button>
          );
        }
        if ((row.status === 'packed' || row.status === 'ready') && row.can_dispatch) {
          actions.push(
            <button key="dispatch" onClick={() => handleAction(row.id, 'dispatch')} className="text-green-600 hover:underline text-sm">
              Dispatch
            </button>
          );
        }
        if (row.status === 'dispatched' || row.status === 'in_transit') {
          actions.push(
            <button key="delivered" onClick={() => handleAction(row.id, 'delivered')} className="text-green-600 hover:underline text-sm">
              Mark Delivered
            </button>
          );
        }
        return <div className="flex gap-2">{actions}</div>;
      }
    }
  ];

  if (loading) {
    return <LoadingSpinner size="lg" className="py-12" />;
  }

  const deliveredCount = dispatches.filter(d => d.status === 'delivered').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Logistics & Dispatch</h1>
        <p className="mt-1 text-sm text-gray-500">Manage packing and dispatch operations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <StatsCard
          title="Total Dispatches"
          value={dispatches.length}
          color="primary"
        />
        <StatsCard
          title="Pending Dispatch"
          value={pendingDispatches.length}
          icon={ClockIcon}
          color="yellow"
        />
        <StatsCard
          title="In Transit"
          value={inTransit.length}
          icon={TruckIcon}
          color="blue"
        />
        <StatsCard
          title="Delivered"
          value={deliveredCount}
          icon={CheckCircleIcon}
          color="green"
        />
      </div>

      {/* Tabs */}
      <Card>
        <div className="flex space-x-4 border-b pb-4 mb-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'all' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All ({dispatches.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Pending ({pendingDispatches.length})
          </button>
          <button
            onClick={() => setActiveTab('transit')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'transit' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            In Transit ({inTransit.length})
          </button>
        </div>

        <DataTable
          columns={columns}
          data={activeTab === 'pending' ? pendingDispatches : activeTab === 'transit' ? inTransit : dispatches}
          emptyMessage="No dispatch records found"
        />
      </Card>
    </div>
  );
}