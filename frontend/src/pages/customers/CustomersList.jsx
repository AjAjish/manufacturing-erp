import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import { customerService } from '../../services/api';
import Card from '../../components/common/Card';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import FormInput from '../../components/forms/FormInput';
import FormSelect from '../../components/forms/FormSelect';
import Alert from '../../components/common/Alert';

export default function CustomersList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    company_name: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    customer_type: '',
    gst_number: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerService.getAll();
      setCustomers(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
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
      await customerService.create(formData);
      setIsModalOpen(false);
      setFormData({
        company_name: '',
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        customer_type: '',
        gst_number: '',
      });
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add customer');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'company_name', label: 'Company' },
    { key: 'name', label: 'Contact' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'city', label: 'City' },
    {
      key: 'customer_type',
      label: 'Type',
      render: (value, row) => <StatusBadge status={value} label={row.customer_type_display} />,
    },
    { key: 'total_orders', label: 'Orders' },
    {
      key: 'is_active',
      label: 'Status',
      render: (value) => (
        <span className={`badge ${value ? 'badge-green' : 'badge-red'}`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="mt-1 text-sm text-gray-500">Manage customer information</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Add Customer
        </button>
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={customers}
          loading={loading}
          emptyMessage="No customers found"
          onRowClick={(row) => navigate(`/customers/${row.id}`)}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setError('');
        }}
        title="Add Customer"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert variant="error">{error}</Alert>}

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Company Name"
              name="company_name"
              value={formData.company_name}
              onChange={handleInputChange}
              placeholder="Company name"
            />
            <FormInput
              label="Contact Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Contact person name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email address"
            />
            <FormInput
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Phone number"
            />
          </div>

          <FormInput
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Street address"
          />

          <div className="grid grid-cols-3 gap-4">
            <FormInput
              label="City"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="City"
            />
            <FormInput
              label="State"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              placeholder="State"
            />
            <FormInput
              label="Postal Code"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleInputChange}
              placeholder="Postal code"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              placeholder="Country"
            />
            <FormSelect
              label="Customer Type"
              name="customer_type"
              value={formData.customer_type}
              onChange={handleInputChange}
              options={[
                { value: '', label: 'Select customer type' },
                { value: 'Manufacturer', label: 'Manufacturer' },
                { value: 'Distributor', label: 'Distributor' },
                { value: 'Retailer', label: 'Retailer' },
                { value: 'Individual', label: 'Individual' },
              ]}
            />
          </div>

          <FormInput
            label="GST Number"
            name="gst_number"
            value={formData.gst_number}
            onChange={handleInputChange}
            placeholder="GST number"
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
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Adding...' : 'Add Customer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}