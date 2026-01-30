import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { orderService } from '../../services/api';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import clsx from 'clsx';

// Tab Components
import OrderCRMTab from './tabs/OrderCRMTab';
import OrderEngineeringTab from './tabs/OrderEngineeringTab';
import OrderMaterialsTab from './tabs/OrderMaterialsTab';
import OrderProductionTab from './tabs/OrderProductionTab';
import OrderFabricationTab from './tabs/OrderFabricationTab';
import OrderInspectionTab from './tabs/OrderInspectionTab';
import OrderLogisticsTab from './tabs/OrderLogisticsTab';

const tabs = [
  { name: 'CRM', component: OrderCRMTab },
  { name: 'Engineering', component: OrderEngineeringTab },
  { name: 'Materials', component: OrderMaterialsTab },
  { name: 'Production', component: OrderProductionTab },
  { name: 'Fabrication', component: OrderFabricationTab },
  { name: 'Inspection', component: OrderInspectionTab },
  { name: 'Logistics', component: OrderLogisticsTab },
];

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await orderService.getById(id);
      setOrder(response.data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
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

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Order not found</p>
        <button onClick={() => navigate('/orders')} className="btn-primary mt-4">
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/orders')}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{order.quote_number}</h1>
            <p className="text-sm text-gray-500">{order.project_name}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <StatusBadge status={order.priority} label={order.priority_display} />
          <StatusBadge status={order.status} label={order.status_display} />
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Order Progress</span>
          <span className="text-sm font-medium text-gray-900">{order.status_percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-primary-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${order.status_percentage}%` }}
          ></div>
        </div>
      </Card>

      {/* Tabs */}
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-primary-100 p-1">
          {tabs.map((tab) => (
            <Tab
              key={tab.name}
              className={({ selected }) =>
                clsx(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-primary-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white text-primary-700 shadow'
                    : 'text-primary-600 hover:bg-white/[0.12] hover:text-primary-800'
                )
              }
            >
              {tab.name}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-4">
          {tabs.map((tab) => (
            <Tab.Panel key={tab.name}>
              <tab.component order={order} onRefresh={fetchOrder} />
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}