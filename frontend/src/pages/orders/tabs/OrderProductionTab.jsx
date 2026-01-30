import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

export default function OrderProductionTab({ order, onRefresh }) {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductionData();
  }, [order.id]);

  const fetchProductionData = async () => {
    try {
      setLoading(true);
      const [recordsRes, summaryRes] = await Promise.all([
        api.get('/production/records/by_order/', { params: { order_id: order.id } }),
        api.get('/production/summaries/by_order/', { params: { order_id: order.id } }).catch(() => null),
      ]);
      setRecords(recordsRes.data);
      if (summaryRes) setSummary(summaryRes.data);
    } catch (error) {
      console.error('Failed to fetch production data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="py-12" />;
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <Card>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{summary.total_produced}</p>
              <p className="text-sm text-gray-500">Total Produced</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{summary.total_ok}</p>
              <p className="text-sm text-gray-500">OK Quantity</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{summary.total_rework}</p>
              <p className="text-sm text-gray-500">Rework</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{summary.total_rejection}</p>
              <p className="text-sm text-gray-500">Rejection</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">{summary.overall_yield_percentage}%</p>
              <p className="text-sm text-gray-500">Yield</p>
            </div>
          </Card>
        </div>
      )}

      {/* Records */}
      <Card title="Production Records">
        {records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shift</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produced</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">OK</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rework</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rejection</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Yield %</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.production_date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.shift_display}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.produced_quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      {record.ok_quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                      {record.rework_quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      {record.rejection_quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.total_yield_percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No production records yet</p>
          </div>
        )}
      </Card>
    </div>
  );
}