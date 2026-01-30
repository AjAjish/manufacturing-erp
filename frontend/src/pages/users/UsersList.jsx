import React, { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { userService } from '../../services/api';
import Card from '../../components/common/Card';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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
        <button className="btn-primary">
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
    </div>
  );
}