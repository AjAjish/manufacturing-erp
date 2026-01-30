import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import StatusBadge from '../../../components/common/StatusBadge';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function OrderInspectionTab({ order, onRefresh }) {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInspections();
  }, [order.id]);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      const response = await api.get('/inspection/order-inspections/by_order/', {
        params: { order_id: order.id },
      });
      setInspections(response.data);
    } catch (error) {
      console.error('Failed to fetch inspections:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="py-12" />;
  }

  return (
    <Card title="Inspection Records">
      {inspections.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Inspection Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Stage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Inspected
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Passed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Failed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Result
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  QA Approved
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inspections.map((inspection) => (
                <tr key={inspection.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {inspection.inspection_type_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {inspection.inspection_type_stage}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {inspection.inspected_quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    {inspection.passed_quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    {inspection.failed_quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={inspection.result} label={inspection.result_display} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {inspection.is_qa_approved ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No inspection records yet</p>
        </div>
      )}
    </Card>
  );
}