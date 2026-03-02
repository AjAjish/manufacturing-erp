import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, ClockIcon, PlusIcon } from '@heroicons/react/24/outline';
import { inspectionService, orderService } from '../../services/api';
import Card from '../../components/common/Card';
import DataTable from '../../components/common/DataTable';
import StatsCard from '../../components/common/StatsCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import FormSelect from '../../components/forms/FormSelect';
import FormInput from '../../components/forms/FormInput';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function InspectionList() {
  const [inspections, setInspections] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [blockedOrders, setBlockedOrders] = useState([]);
  const [inspectionTypes, setInspectionTypes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    order: '',
    inspection_type: '',
    inspected_quantity: '',
    passed_quantity: '',
    failed_quantity: '',
    rework_quantity: '',
    result: 'pending',
    inspection_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allRes, pendingRes] = await Promise.all([
        inspectionService.getAll(),
        inspectionService.getPendingApproval(),
      ]);
      setInspections(allRes.data.results || allRes.data);
      setPendingApprovals(pendingRes.data);

      const [typesRes, blockedRes, ordersRes] = await Promise.all([
        inspectionService.getTypes(),
        inspectionService.getDispatchBlocked(),
        orderService.getAll(),
      ]);
      setInspectionTypes(typesRes.data.results || typesRes.data || []);
      setBlockedOrders(blockedRes.data.results || blockedRes.data || []);
      setOrders(ordersRes.data.results || ordersRes.data || []);
    } catch (error) {
      console.error('Failed to fetch inspections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInspection = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await inspectionService.create(formData);
      toast.success('Inspection created');
      setIsModalOpen(false);
      setFormData({
        order: '',
        inspection_type: '',
        inspected_quantity: '',
        passed_quantity: '',
        failed_quantity: '',
        rework_quantity: '',
        result: 'pending',
        inspection_date: new Date().toISOString().split('T')[0],
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create inspection');
    } finally {
      setSaving(false);
    }
  };

  const handleQAApprove = async (inspectionId, approved) => {
    try {
      await inspectionService.qaApprove(inspectionId, { 
        approved, 
        remarks: approved ? 'Approved' : 'Rejected' 
      });
      toast.success(approved ? 'Inspection approved' : 'Inspection rejected');
      fetchData();
    } catch (error) {
      toast.error('Failed to update inspection');
    }
  };

  const columns = [
    { key: 'order_quote_number', label: 'Order' },
    { key: 'inspection_type_name', label: 'Type' },
    { key: 'inspection_type_stage', label: 'Stage' },
    { key: 'inspected_quantity', label: 'Inspected' },
    { 
      key: 'passed_quantity', 
      label: 'Passed',
      render: (v) => <span className="text-green-600 font-medium">{v}</span>
    },
    { 
      key: 'failed_quantity', 
      label: 'Failed',
      render: (v) => <span className="text-red-600 font-medium">{v}</span>
    },
    {
      key: 'result',
      label: 'Result',
      render: (v, row) => <StatusBadge status={v} label={row.result_display} />
    },
    {
      key: 'is_qa_approved',
      label: 'QA Approved',
      render: (v) => v ? (
        <CheckCircleIcon className="h-5 w-5 text-green-500" />
      ) : (
        <ClockIcon className="h-5 w-5 text-yellow-500" />
      )
    },
    { key: 'inspection_date', label: 'Date' },
  ];

  const pendingColumns = [
    ...columns.slice(0, -1),
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleQAApprove(row.id, true)}
            className="text-green-600 hover:text-green-800"
            title="Approve"
          >
            <CheckCircleIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleQAApprove(row.id, false)}
            className="text-red-600 hover:text-red-800"
            title="Reject"
          >
            <XCircleIcon className="h-5 w-5" />
          </button>
        </div>
      )
    }
  ];

  const blockedColumns = [
    { key: 'quote_number', label: 'Order' },
    { key: 'project_name', label: 'Project' },
    { key: 'customer_name', label: 'Customer' },
    {
      key: 'status',
      label: 'Order Status',
      render: (v, row) => <StatusBadge status={v} label={row.status_display} />,
    },
  ];

  if (loading) {
    return <LoadingSpinner size="lg" className="py-12" />;
  }

  const passedCount = inspections.filter(i => i.result === 'pass').length;
  const failedCount = inspections.filter(i => i.result === 'fail').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quality Inspection</h1>
        <p className="mt-1 text-sm text-gray-500">Manage inspection records and QA approvals</p>
      </div>

      <div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Create Inspection
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <StatsCard
          title="Total Inspections"
          value={inspections.length}
          color="primary"
        />
        <StatsCard
          title="Passed"
          value={passedCount}
          icon={CheckCircleIcon}
          color="green"
        />
        <StatsCard
          title="Failed"
          value={failedCount}
          icon={XCircleIcon}
          color="red"
        />
        <StatsCard
          title="Pending Approval"
          value={pendingApprovals.length}
          icon={ClockIcon}
          color="yellow"
        />
      </div>

      {/* Tabs */}
      <Card>
        <div className="flex space-x-4 border-b pb-4 mb-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'all' 
                ? 'bg-primary-100 text-primary-700' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All Inspections ({inspections.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'pending' 
                ? 'bg-yellow-100 text-yellow-700' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Pending Approval ({pendingApprovals.length})
          </button>
          <button
            onClick={() => setActiveTab('blocked')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'blocked'
                ? 'bg-red-100 text-red-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Dispatch Blocked ({blockedOrders.length})
          </button>
        </div>

        {activeTab === 'all' ? (
          <DataTable
            columns={columns}
            data={inspections}
            emptyMessage="No inspection records found"
          />
        ) : activeTab === 'pending' ? (
          <DataTable
            columns={pendingColumns}
            data={pendingApprovals}
            emptyMessage="No pending approvals"
          />
        ) : (
          <DataTable
            columns={blockedColumns}
            data={blockedOrders}
            emptyMessage="No dispatch blocked orders"
          />
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Inspection">
        <form className="space-y-4" onSubmit={handleCreateInspection}>
          <FormSelect
            label="Order"
            name="order"
            required
            value={formData.order}
            onChange={(e) => setFormData((prev) => ({ ...prev, order: e.target.value }))}
            options={[
              { value: '', label: 'Select order' },
              ...orders.map((order) => ({ value: order.id, label: `${order.quote_number} - ${order.customer_name || order.project_name}` })),
            ]}
          />

          <FormSelect
            label="Inspection Type"
            name="inspection_type"
            required
            value={formData.inspection_type}
            onChange={(e) => setFormData((prev) => ({ ...prev, inspection_type: e.target.value }))}
            options={[
              { value: '', label: 'Select type' },
              ...inspectionTypes.map((type) => ({ value: type.id, label: `${type.code} - ${type.name}` })),
            ]}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormInput
              label="Inspection Date"
              name="inspection_date"
              type="date"
              value={formData.inspection_date}
              onChange={(e) => setFormData((prev) => ({ ...prev, inspection_date: e.target.value }))}
            />
            <FormSelect
              label="Result"
              name="result"
              value={formData.result}
              onChange={(e) => setFormData((prev) => ({ ...prev, result: e.target.value }))}
              options={[
                { value: 'pending', label: 'Pending' },
                { value: 'pass', label: 'Pass' },
                { value: 'fail', label: 'Fail' },
                { value: 'conditional', label: 'Conditional' },
                { value: 'rework', label: 'Rework' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <FormInput
              label="Inspected"
              name="inspected_quantity"
              type="number"
              min="0"
              value={formData.inspected_quantity}
              onChange={(e) => setFormData((prev) => ({ ...prev, inspected_quantity: e.target.value }))}
            />
            <FormInput
              label="Passed"
              name="passed_quantity"
              type="number"
              min="0"
              value={formData.passed_quantity}
              onChange={(e) => setFormData((prev) => ({ ...prev, passed_quantity: e.target.value }))}
            />
            <FormInput
              label="Failed"
              name="failed_quantity"
              type="number"
              min="0"
              value={formData.failed_quantity}
              onChange={(e) => setFormData((prev) => ({ ...prev, failed_quantity: e.target.value }))}
            />
            <FormInput
              label="Rework"
              name="rework_quantity"
              type="number"
              min="0"
              value={formData.rework_quantity}
              onChange={(e) => setFormData((prev) => ({ ...prev, rework_quantity: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Creating...' : 'Create Inspection'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}