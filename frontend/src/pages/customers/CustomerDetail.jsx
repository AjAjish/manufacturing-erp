import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { customerService } from '../../services/api';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerData();
  }, [id]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const [customerRes, ordersRes] = await Promise.all([
        customerService.getById(id),
        customerService.getOrders(id),
      ]);
      setCustomer(customerRes.data);
      setOrders(ordersRes.data);
    } catch (error) {
      console.error('Failed to fetch customer:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="py-12" />;
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Customer not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate('/customers')} className="p-2 text-gray-400 hover:text-gray-600">
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{customer.company_name}</h1>
          <p className="text-sm text-gray-500">{customer.customer_type_display}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Company Information">
          <dl className="space-y-4">
            <div><dt className="text-sm font-medium text-gray-500">Company Name</dt><dd className="text-sm text-gray-900">{customer.company_name}</dd></div>
            <div><dt className="text-sm font-medium text-gray-500">Contact Person</dt><dd className="text-sm text-gray-900">{customer.name}</dd></div>
            <div><dt className="text-sm font-medium text-gray-500">Email</dt><dd className="text-sm text-gray-900">{customer.email}</dd></div>
            <div><dt className="text-sm font-medium text-gray-500">Phone</dt><dd className="text-sm text-gray-900">{customer.phone}</dd></div>
            <div><dt className="text-sm font-medium text-gray-500">GST Number</dt><dd className="text-sm text-gray-900">{customer.gst_number || '-'}</dd></div>
          </dl>
        </Card>

        <Card title="Address">
          <dl className="space-y-4">
            <div><dt className="text-sm font-medium text-gray-500">Address</dt><dd className="text-sm text-gray-900">{customer.address}</dd></div>
            <div><dt className="text-sm font-medium text-gray-500">City</dt><dd className="text-sm text-gray-900">{customer.city}</dd></div>
            <div><dt className="text-sm font-medium text-gray-500">State</dt><dd className="text-sm text-gray-900">{customer.state}</dd></div>
            <div><dt className="text-sm font-medium text-gray-500">Postal Code</dt><dd className="text-sm text-gray-900">{customer.postal_code}</dd></div>
          </dl>
        </Card>
      </div>

      <Card title={`Orders (${orders.length})`}>
        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quote #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/orders/${order.id}`)}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.quote_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.project_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={order.status} label={order.status_display} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{order.total_amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center py-8 text-gray-500">No orders found</p>
        )}
      </Card>
    </div>
  );
}