import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import StatusBadge from '../../../components/common/StatusBadge';

export default function OrderLogisticsTab({ order, onRefresh }) {
  const [dispatch, setDispatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDispatch();
  }, [order.id]);

  const fetchDispatch = async () => {
    try {
      setLoading(true);
      const response = await api.get('/logistics/dispatches/by_order/', {
        params: { order_id: order.id },
      });
      setDispatch(response.data);
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Failed to fetch dispatch:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="py-12" />;
  }

  if (!dispatch) {
    return (
      <Card title="Dispatch Information">
        <div className="text-center py-12">
          <p className="text-gray-500">No dispatch record created yet</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Dispatch Status */}
      <Card title="Dispatch Status">
        <dl className="space-y-4">
          <div className="flex justify-between">
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd>
              <StatusBadge status={dispatch.status} label={dispatch.status_display} />
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm font-medium text-gray-500">Can Dispatch</dt>
            <dd className="text-sm text-gray-900">{dispatch.can_dispatch ? 'Yes' : 'No - QA Pending'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm font-medium text-gray-500">Planned Dispatch Date</dt>
            <dd className="text-sm text-gray-900">{dispatch.planned_dispatch_date || '-'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm font-medium text-gray-500">Actual Dispatch Date</dt>
            <dd className="text-sm text-gray-900">{dispatch.actual_dispatch_date || '-'}</dd>
          </div>
        </dl>
      </Card>

      {/* Packing Details */}
      <Card title="Packing Details">
        <dl className="space-y-4">
          <div className="flex justify-between">
            <dt className="text-sm font-medium text-gray-500">Packing Standard</dt>
            <dd className="text-sm text-gray-900">{dispatch.packing_standard_name || '-'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm font-medium text-gray-500">Total Packages</dt>
            <dd className="text-sm text-gray-900">{dispatch.total_packages || '-'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm font-medium text-gray-500">Gross Weight</dt>
            <dd className="text-sm text-gray-900">{dispatch.gross_weight ? `${dispatch.gross_weight} kg` : '-'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm font-medium text-gray-500">Dimensions</dt>
            <dd className="text-sm text-gray-900">{dispatch.dimensions || '-'}</dd>
          </div>
        </dl>
      </Card>

      {/* Transport Details */}
      <Card title="Transport Details">
        <dl className="space-y-4">
          <div className="flex justify-between">
            <dt className="text-sm font-medium text-gray-500">Transport Mode</dt>
            <dd className="text-sm text-gray-900">{dispatch.transport_mode_display}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm font-medium text-gray-500">Transport Scope</dt>
            <dd className="text-sm text-gray-900">{dispatch.transport_scope_display}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm font-medium text-gray-500">Transporter</dt>
            <dd className="text-sm text-gray-900">{dispatch.transporter_name || '-'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm font-medium text-gray-500">Vehicle Number</dt>
            <dd className="text-sm text-gray-900">{dispatch.vehicle_number || '-'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm font-medium text-gray-500">Tracking Number</dt>
            <dd className="text-sm text-gray-900">{dispatch.tracking_number || '-'}</dd>
          </div>
        </dl>
      </Card>

      {/* Delivery Address */}
      <Card title="Delivery Address">
        <div className="text-sm text-gray-900">
          {dispatch.delivery_address || order.customer_details?.address || 'Same as customer address'}
        </div>
        {dispatch.delivery_contact_name && (
          <div className="mt-4">
            <p className="text-sm text-gray-500">Contact: {dispatch.delivery_contact_name}</p>
            <p className="text-sm text-gray-500">Phone: {dispatch.delivery_contact_phone}</p>
          </div>
        )}
      </Card>
    </div>
  );
}