import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import { customerService } from '../../services/api';
import Card from '../../components/common/Card';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';

export default function CustomersList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
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
        <Link to="/customers/new" className="btn-primary">
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Add Customer
        </Link>
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
    </div>
  );
}