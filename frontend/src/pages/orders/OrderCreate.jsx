import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { orderService, customerService } from '../../services/api';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function OrderCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await customerService.getAll({ is_active: true });
      setCustomers(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await orderService.create(data);
      toast.success('Order created successfully');
      navigate(`/orders/${response.data.id}`);
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to create order';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/orders')}
          className="p-2 text-gray-400 hover:text-gray-600"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Order</h1>
          <p className="text-sm text-gray-500">Fill in the order details below</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Basic Information */}
          <Card title="Basic Information">
            <div className="space-y-4">
              <div>
                <label className="label">Quote Number *</label>
                <input
                  type="text"
                  className="input"
                  {...register('quote_number', { required: 'Quote number is required' })}
                />
                {errors.quote_number && (
                  <p className="mt-1 text-sm text-red-600">{errors.quote_number.message}</p>
                )}
              </div>

              <div>
                <label className="label">PO Number</label>
                <input type="text" className="input" {...register('po_number')} />
              </div>

              <div>
                <label className="label">Work Order Number</label>
                <input type="text" className="input" {...register('work_order_number')} />
              </div>

              <div>
                <label className="label">Customer *</label>
                <select
                  className="input"
                  {...register('customer', { required: 'Customer is required' })}
                >
                  <option value="">Select Customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.company_name}
                    </option>
                  ))}
                </select>
                {errors.customer && (
                  <p className="mt-1 text-sm text-red-600">{errors.customer.message}</p>
                )}
              </div>

              <div>
                <label className="label">Project Name *</label>
                <input
                  type="text"
                  className="input"
                  {...register('project_name', { required: 'Project name is required' })}
                />
                {errors.project_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.project_name.message}</p>
                )}
              </div>

              <div>
                <label className="label">Description</label>
                <textarea rows={3} className="input" {...register('description')} />
              </div>
            </div>
          </Card>

          {/* Order Details */}
          <Card title="Order Details">
            <div className="space-y-4">
              <div>
                <label className="label">Ordered Quantity *</label>
                <input
                  type="number"
                  min="1"
                  className="input"
                  {...register('ordered_quantity', {
                    required: 'Quantity is required',
                    min: { value: 1, message: 'Minimum quantity is 1' },
                  })}
                />
                {errors.ordered_quantity && (
                  <p className="mt-1 text-sm text-red-600">{errors.ordered_quantity.message}</p>
                )}
              </div>

              <div>
                <label className="label">Unit Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input"
                  {...register('unit_price')}
                />
              </div>

              <div>
                <label className="label">Planned Lead Time (Days) *</label>
                <input
                  type="number"
                  min="1"
                  className="input"
                  defaultValue={30}
                  {...register('planned_lead_time', {
                    required: 'Lead time is required',
                    min: { value: 1, message: 'Minimum is 1 day' },
                  })}
                />
                {errors.planned_lead_time && (
                  <p className="mt-1 text-sm text-red-600">{errors.planned_lead_time.message}</p>
                )}
              </div>

              <div>
                <label className="label">Expected Delivery Date</label>
                <input type="date" className="input" {...register('expected_delivery_date')} />
              </div>

              <div>
                <label className="label">Priority *</label>
                <select className="input" {...register('priority', { required: true })}>
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="label">Remarks</label>
                <textarea rows={3} className="input" {...register('remarks')} />
              </div>
            </div>
          </Card>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end space-x-4">
          <button type="button" onClick={() => navigate('/orders')} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? <LoadingSpinner size="sm" /> : 'Create Order'}
          </button>
        </div>
      </form>
    </div>
  );
}