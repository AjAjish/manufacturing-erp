import React, { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { userService } from '../../services/api';
import Card from '../../components/common/Card';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import FormInput from '../../components/forms/FormInput';
import FormSelect from '../../components/forms/FormSelect';
import Alert from '../../components/common/Alert';
import toast from 'react-hot-toast';

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: '',
    phone: '',
    department: '',
    employee_id: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAll();
      setUsers(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId) => {
    try {
      await userService.toggleActive(userId);
      toast.success('User status updated');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user');
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
      await userService.create(formData);
      setIsModalOpen(false);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        role: '',
        phone: '',
        department: '',
        employee_id: '',
      });
      toast.success('User created successfully');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { 
      key: 'full_name', 
      label: 'Name',
      render: (_, row) => `${row.first_name} ${row.last_name}`
    },
    { key: 'email', label: 'Email' },
    { key: 'role_display', label: 'Role' },
    { key: 'department', label: 'Department' },
    { key: 'employee_id', label: 'Employee ID' },
    {
      key: 'is_active',
      label: 'Status',
      render: (v) => (
        <span className={`badge ${v ? 'badge-green' : 'badge-red'}`}>
          {v ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button
          onClick={() => handleToggleActive(row.id)}
          className={`text-sm ${row.is_active ? 'text-red-600' : 'text-green-600'} hover:underline`}
        >
          {row.is_active ? 'Deactivate' : 'Activate'}
        </button>
      )
    }
  ];

  if (loading) {
    return <LoadingSpinner size="lg" className="py-12" />;
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">Manage user accounts and roles</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Add User
        </button>
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={users}
          emptyMessage="No users found"
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setError('');
        }}
        title="Add User"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert variant="error">{error}</Alert>}

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="First Name"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              placeholder="First name"
              required
            />
            <FormInput
              label="Last Name"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              placeholder="Last name"
              required
            />
          </div>

          <FormInput
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email address"
            required
          />

          <FormInput
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Password"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
              options={[
                { value: '', label: 'Select role' },
                { value: 'admin', label: 'Admin' },
                { value: 'sales', label: 'Sales / CRM' },
                { value: 'engineering', label: 'Engineering' },
                { value: 'production', label: 'Production' },
                { value: 'quality', label: 'Quality / Inspection' },
                { value: 'logistics', label: 'Logistics' },
                { value: 'management', label: 'Management' },
              ]}
            />
            <FormInput
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Phone number"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              placeholder="Department"
            />
            <FormInput
              label="Employee ID"
              name="employee_id"
              value={formData.employee_id}
              onChange={handleInputChange}
              placeholder="Employee ID"
            />
          </div>

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
              {saving ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}