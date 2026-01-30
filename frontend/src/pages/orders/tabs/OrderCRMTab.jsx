import React from 'react';
import Card from '../../../components/common/Card';

export default function OrderCRMTab({ order, onRefresh }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Order Information */}
      <Card title="Order Information">
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Quote Number</dt>
            <dd className="mt-1 text-sm text-gray-900">{order.quote_number}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">PO Number</dt>
            <dd className="mt-1 text-sm text-gray-900">{order.po_number || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Work Order Number</dt>
            <dd className="mt-1 text-sm text-gray-900">{order.work_order_number || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Invoice Number</dt>
            <dd className="mt-1 text-sm text-gray-900">{order.invoice_number || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">GRN Number</dt>
            <dd className="mt-1 text-sm text-gray-900">{order.grn_number || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Ordered Quantity</dt>
            <dd className="mt-1 text-sm text-gray-900">{order.ordered_quantity}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Unit Price</dt>
            <dd className="mt-1 text-sm text-gray-900">₹{order.unit_price}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
            <dd className="mt-1 text-sm text-gray-900 font-semibold">₹{order.total_amount}</dd>
          </div>
        </dl>
      </Card>

      {/* Customer Information */}
      <Card title="Customer Information">
        <dl className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Company Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{order.customer_details?.company_name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Contact Person</dt>
            <dd className="mt-1 text-sm text-gray-900">{order.customer_details?.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="mt-1 text-sm text-gray-900">{order.customer_details?.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Phone</dt>
            <dd className="mt-1 text-sm text-gray-900">{order.customer_details?.phone}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">City</dt>
            <dd className="mt-1 text-sm text-gray-900">{order.customer_details?.city}</dd>
          </div>
        </dl>
      </Card>

      {/* Timeline */}
      <Card title="Timeline">
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Order Date</dt>
            <dd className="mt-1 text-sm text-gray-900">{order.order_date}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Planned Lead Time</dt>
            <dd className="mt-1 text-sm text-gray-900">{order.planned_lead_time} days</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Expected Delivery</dt>
            <dd className="mt-1 text-sm text-gray-900">{order.expected_delivery_date || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Actual Delivery</dt>
            <dd className="mt-1 text-sm text-gray-900">{order.actual_delivery_date || '-'}</dd>
          </div>
        </dl>
      </Card>

      {/* Remarks */}
      <Card title="Remarks & Notes">
        <div className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Remarks</dt>
            <dd className="mt-1 text-sm text-gray-900">{order.remarks || 'No remarks'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Internal Notes</dt>
            <dd className="mt-1 text-sm text-gray-900">{order.internal_notes || 'No internal notes'}</dd>
          </div>
        </div>
      </Card>
    </div>
  );
}