import React, { useState, useEffect } from 'react';
import { PlusIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { materialService } from '../../services/api';
import Card from '../../components/common/Card';
import DataTable from '../../components/common/DataTable';
import StatsCard from '../../components/common/StatsCard';
import Modal from '../../components/common/Modal';
import FormInput from '../../components/forms/FormInput';
import FormSelect from '../../components/forms/FormSelect';
import Alert from '../../components/common/Alert';

export default function MaterialsList() {
  const [materials, setMaterials] = useState([]);
  const [lowStockMaterials, setLowStockMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    material_type: '',
    grade: '',
    dimensions: '',
    stock_quantity: '',
    minimum_stock: '',
    unit: 'kg',
    unit_price: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      await materialService.create(formData);
      setIsModalOpen(false);
      setFormData({
        code: '',
        name: '',
        material_type: '',
        grade: '',
        dimensions: '',
        stock_quantity: '',
        minimum_stock: '',
        unit: 'kg',
        unit_price: '',
      });
      fetchMaterials();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add material');
    } finally {
      setSaving(false);
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
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
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

      {/* Add Material Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setError('');
        }}
        title="Add New Material"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert variant="error">{error}</Alert>}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput
              label="Material Code"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              required
              placeholder="e.g., MAT001"
            />
            <FormInput
              label="Material Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="e.g., Steel Plate"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput
              label="Material Type"
              name="material_type"
              value={formData.material_type}
              onChange={handleInputChange}
              required
              placeholder="e.g., Steel, Aluminum"
            />
            <FormInput
              label="Grade"
              name="grade"
              value={formData.grade}
              onChange={handleInputChange}
              placeholder="e.g., SS304, IS2062"
            />
          </div>

          <FormInput
            label="Dimensions"
            name="dimensions"
            value={formData.dimensions}
            onChange={handleInputChange}
            placeholder="e.g., 2000mm x 1000mm x 10mm"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormInput
              label="Stock Quantity"
              name="stock_quantity"
              type="number"
              step="0.01"
              value={formData.stock_quantity}
              onChange={handleInputChange}
              required
              placeholder="0.00"
            />
            <FormInput
              label="Minimum Stock"
              name="minimum_stock"
              type="number"
              step="0.01"
              value={formData.minimum_stock}
              onChange={handleInputChange}
              required
              placeholder="0.00"
            />
            <FormSelect
              label="Unit"
              name="unit"
              value={formData.unit}
              onChange={handleInputChange}
              options={[
                { value: 'kg', label: 'Kilograms (kg)' },
                { value: 'ton', label: 'Tons' },
                { value: 'pcs', label: 'Pieces' },
                { value: 'meter', label: 'Meters' },
                { value: 'sqm', label: 'Square Meters' },
                { value: 'ltr', label: 'Liters' },
              ]}
            />
          </div>

          <FormInput
            label="Unit Price (₹)"
            name="unit_price"
            type="number"
            step="0.01"
            value={formData.unit_price}
            onChange={handleInputChange}
            required
            placeholder="0.00"
          />

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setError('');
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Adding...' : 'Add Material'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}