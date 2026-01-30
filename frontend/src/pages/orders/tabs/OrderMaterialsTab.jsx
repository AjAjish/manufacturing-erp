import React, { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import api from '../../../services/api';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import StatusBadge from '../../../components/common/StatusBadge';

export default function OrderMaterialsTab({ order, onRefresh }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, [order.id]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await api.get('/materials/order-materials/by_order/', {
        params: { order_id: order.id },
      });
      setMaterials(response.data);
    } catch (error) {
      console.error('Failed to fetch materials:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="py-12" />;
  }

  return (
    <Card title="Materials Required">
      {materials.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Material
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Required Qty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Issued Qty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Pending
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {materials.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.material_name}</p>
                      <p className="text-sm text-gray-500">{item.material_code}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.required_quantity} {item.material_unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.issued_quantity} {item.material_unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.pending_quantity} {item.material_unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={item.status} label={item.status_display} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No materials assigned to this order</p>
        </div>
      )}
    </Card>
  );
}