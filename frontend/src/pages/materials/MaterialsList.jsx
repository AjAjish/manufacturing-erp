import React, { useState, useEffect } from 'react';
import { PlusIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { materialService } from '../../services/api';
import Card from '../../components/common/Card';
import DataTable from '../../components/common/DataTable';
import StatsCard from '../../components/common/StatsCard';

export default function MaterialsList() {
  const [materials, setMaterials] = useState([]);
  const [lowStockMaterials, setLowStockMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const [allRes, lowStockRes] = await Promise.all([
        materialService.getAll(),
        materialService.getLowStock(),
      ]);
      setMaterials(allRes.data.results || allRes.data);
      setLowStockMaterials(lowStockRes.data);
    } catch (error) {
      console.error('Failed to fetch materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'code', label: 'Code' },
    { key: 'name', label: 'Name' },
    { key: 'material_type_name', label: 'Type' },
    { key: 'grade', label: 'Grade' },
    { key: 'dimensions', label: 'Dimensions' },
    { 
      key: 'stock_quantity', 
      label: 'Stock', 
      render: (v, row) => `${v} ${row.unit_display}` 
    },
    { 
      key: 'minimum_stock', 
      label: 'Min Stock', 
      render: (v, row) => `${v} ${row.unit_display}` 
    },
    {
      key: 'is_low_stock',
      label: 'Status',
      render: (value) => (
        <span className={`badge ${value ? 'badge-red' : 'badge-green'}`}>
          {value ? 'Low Stock' : 'OK'}
        </span>
      ),
    },
    { 
      key: 'unit_price', 
      label: 'Price', 
      render: (v) => `₹${v}` 
    },
  ];

  const displayedMaterials = filter === 'low_stock' ? lowStockMaterials : materials;

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Materials</h1>
          <p className="mt-1 text-sm text-gray-500">Manage material inventory</p>
        </div>
        <button className="btn-primary">
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Add Material
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatsCard
          title="Total Materials"
          value={materials.length}
          color="primary"
        />
        <StatsCard
          title="Low Stock Items"
          value={lowStockMaterials.length}
          icon={ExclamationTriangleIcon}
          color="red"
        />
        <StatsCard
          title="Active Materials"
          value={materials.filter(m => m.is_active).length}
          color="green"
        />
      </div>

      {/* Filter */}
      <Card>
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'all' 
                ? 'bg-primary-100 text-primary-700' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All Materials ({materials.length})
          </button>
          <button
            onClick={() => setFilter('low_stock')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'low_stock' 
                ? 'bg-red-100 text-red-700' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Low Stock ({lowStockMaterials.length})
          </button>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <DataTable
          columns={columns}
          data={displayedMaterials}
          loading={loading}
          emptyMessage="No materials found"
        />
      </Card>
    </div>
  );
}