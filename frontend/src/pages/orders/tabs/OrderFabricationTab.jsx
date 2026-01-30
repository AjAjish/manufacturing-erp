import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import StatusBadge from '../../../components/common/StatusBadge';

export default function OrderFabricationTab({ order, onRefresh }) {
  const [fabrications, setFabrications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFabrications();
  }, [order.id]);

  const fetchFabrications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/fabrication/order-fabrications/by_order/', {
        params: { order_id: order.id },
      });
      setFabrications(response.data);
    } catch (error) {
      console.error('Failed to fetch fabrications:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="py-12" />;
  }

  return (
    <Card title="Fabrication Processes">
      {fabrications.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Process</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Planned Qty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fabrications.map((fab) => (
                <tr key={fab.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-medium text-gray-900">{fab.process_name}</p>
                    <p className="text-sm text-gray-500">{fab.process_code}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {fab.process_category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {fab.planned_quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {fab.completed_quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${fab.completion_percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{fab.completion_percentage}%</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={fab.status} label={fab.status_display} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No fabrication processes assigned</p>
        </div>
      )}
    </Card>
  );
}