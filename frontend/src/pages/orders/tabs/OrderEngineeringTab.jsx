import React, { useState, useEffect } from 'react';
import { DocumentIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import api from '../../../services/api';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import StatusBadge from '../../../components/common/StatusBadge';
import toast from 'react-hot-toast';

export default function OrderEngineeringTab({ order, onRefresh }) {
  const [drawings, setDrawings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDrawings();
  }, [order.id]);

  const fetchDrawings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/engineering/drawings/by_order/', {
        params: { order_id: order.id },
      });
      setDrawings(response.data);
    } catch (error) {
      console.error('Failed to fetch drawings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('order', order.id);
    formData.append('drawing_number', `DRW-${Date.now()}`);
    formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
    formData.append('drawing_type', 'production');

    try {
      setUploading(true);
      await api.post('/engineering/drawings/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Drawing uploaded successfully');
      fetchDrawings();
    } catch (error) {
      toast.error('Failed to upload drawing');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="py-12" />;
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card
        title="Engineering Drawings"
        actions={
          <label className="btn-primary cursor-pointer">
            <ArrowUpTrayIcon className="-ml-1 mr-2 h-5 w-5" />
            {uploading ? 'Uploading...' : 'Upload Drawing'}
            <input
              type="file"
              className="hidden"
              accept=".pdf,.dwg,.dxf,.step,.stp,.igs,.iges"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        }
      >
        {drawings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Drawing #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Version
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {drawings.map((drawing) => (
                  <tr key={drawing.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {drawing.drawing_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {drawing.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {drawing.drawing_type_display}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      v{drawing.version} ({drawing.revision})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={drawing.status} label={drawing.status_display} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {drawing.file_url && (
                        <a
                          href={drawing.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-800"
                        >
                          Download
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-500">No drawings uploaded yet</p>
          </div>
        )}
      </Card>
    </div>
  );
}