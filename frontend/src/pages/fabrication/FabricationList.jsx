import React, { useEffect, useState } from 'react';
import { PlusIcon, PlayIcon, PauseIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { fabricationService, orderService } from '../../services/api';
import Card from '../../components/common/Card';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import FormInput from '../../components/forms/FormInput';
import FormSelect from '../../components/forms/FormSelect';
import StatusBadge from '../../components/common/StatusBadge';
import toast from 'react-hot-toast';

export default function FabricationList() {
  const [fabrications, setFabrications] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [orderFilter, setOrderFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    order: '',
    process: '',
    planned_quantity: '',
    planned_start_date: '',
    planned_end_date: '',
    machine: '',
    remarks: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fabricationsRes, processRes, ordersRes] = await Promise.all([
        fabricationService.getOrderFabrications(),
        fabricationService.getProcesses(),
        orderService.getAll(),
      ]);

      setFabrications(fabricationsRes.data.results || fabricationsRes.data || []);
      setProcesses(processRes.data.results || processRes.data || []);
      setOrders(ordersRes.data.results || ordersRes.data || []);
    } catch (error) {
      toast.error('Failed to load fabrication data');
    } finally {
      setLoading(false);
    }
  };

  const fetchByTab = async (tab, selectedOrderId = orderFilter) => {
    try {
      setLoading(true);
      if (tab === 'in_progress') {
        const inProgressRes = await fabricationService.getInProgress();
        setFabrications(inProgressRes.data.results || inProgressRes.data || []);
      } else if (tab === 'by_order' && selectedOrderId) {
        const byOrderRes = await fabricationService.getByOrder(selectedOrderId);
        setFabrications(byOrderRes.data.results || byOrderRes.data || []);
      } else {
        const allRes = await fabricationService.getOrderFabrications();
        setFabrications(allRes.data.results || allRes.data || []);
      }
    } catch (error) {
      toast.error('Failed to load fabrications');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'start') {
        await fabricationService.start(id);
        toast.success('Fabrication started');
      } else if (action === 'complete') {
        await fabricationService.complete(id, {});
        toast.success('Fabrication completed');
      } else if (action === 'hold') {
        await fabricationService.hold(id, { notes: 'Put on hold from dashboard' });
        toast.success('Fabrication put on hold');
      }
      fetchByTab(activeTab);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Action failed');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await fabricationService.create(formData);
      toast.success('Fabrication record created');
      setIsModalOpen(false);
      setFormData({
        order: '',
        process: '',
        planned_quantity: '',
        planned_start_date: '',
        planned_end_date: '',
        machine: '',
        remarks: '',
      });
      fetchByTab(activeTab);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create fabrication');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'order_quote_number', label: 'Order' },
    { key: 'process_name', label: 'Process' },
    { key: 'process_category', label: 'Category' },
    { key: 'machine', label: 'Machine' },
    { key: 'planned_quantity', label: 'Planned Qty' },
    { key: 'completed_quantity', label: 'Completed Qty' },
    {
      key: 'status',
      label: 'Status',
      render: (value, row) => <StatusBadge status={value} label={row.status_display} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          {(row.status === 'not_started' || row.status === 'pending') && (
            <button className="btn-tertiary px-3 py-2" onClick={() => handleAction(row.id, 'start')}>
              <PlayIcon className="h-4 w-4" />
            </button>
          )}
          {row.status === 'in_progress' && (
            <>
              <button className="btn-success px-3 py-2" onClick={() => handleAction(row.id, 'complete')}>
                <CheckCircleIcon className="h-4 w-4" />
              </button>
              <button className="btn-secondary px-3 py-2" onClick={() => handleAction(row.id, 'hold')}>
                <PauseIcon className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return <LoadingSpinner size="lg" className="py-12" />;
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-accent-900 dark:text-white">Fabrication</h1>
          <p className="mt-1 text-sm text-accent-600 dark:text-accent-400">Track fabrication process actions and progress</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Add Fabrication
        </button>
      </div>

      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                setActiveTab('all');
                fetchByTab('all');
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'all'
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                  : 'text-accent-600 hover:text-accent-900 dark:text-accent-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => {
                setActiveTab('in_progress');
                fetchByTab('in_progress');
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'in_progress'
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                  : 'text-accent-600 hover:text-accent-900 dark:text-accent-300'
              }`}
            >
              In Progress
            </button>
          </div>

          <div className="flex w-full gap-3 md:w-auto">
            <FormSelect
              name="orderFilter"
              label="By Order"
              value={orderFilter}
              onChange={(e) => setOrderFilter(e.target.value)}
              options={[
                { value: '', label: 'Select order' },
                ...orders.map((order) => ({ value: order.id, label: order.quote_number })),
              ]}
            />
            <button
              type="button"
              className="btn-secondary self-end"
              onClick={() => {
                setActiveTab('by_order');
                fetchByTab('by_order', orderFilter);
              }}
              disabled={!orderFilter}
            >
              Apply
            </button>
          </div>
        </div>

        <div className="mt-6">
          <DataTable columns={columns} data={fabrications} emptyMessage="No fabrication records found" />
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Fabrication Record">
        <form className="space-y-4" onSubmit={handleCreate}>
          <FormSelect
            label="Order"
            name="order"
            value={formData.order}
            onChange={(e) => setFormData((prev) => ({ ...prev, order: e.target.value }))}
            required
            options={[
              { value: '', label: 'Select order' },
              ...orders.map((order) => ({
                value: order.id,
                label: `${order.quote_number} - ${order.customer_name || order.project_name}`,
              })),
            ]}
          />

          <FormSelect
            label="Process"
            name="process"
            value={formData.process}
            onChange={(e) => setFormData((prev) => ({ ...prev, process: e.target.value }))}
            required
            options={[
              { value: '', label: 'Select process' },
              ...processes.map((process) => ({
                value: process.id,
                label: `${process.code} - ${process.name}`,
              })),
            ]}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormInput
              label="Planned Quantity"
              name="planned_quantity"
              type="number"
              min="1"
              required
              value={formData.planned_quantity}
              onChange={(e) => setFormData((prev) => ({ ...prev, planned_quantity: e.target.value }))}
            />
            <FormInput
              label="Machine"
              name="machine"
              value={formData.machine}
              onChange={(e) => setFormData((prev) => ({ ...prev, machine: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormInput
              label="Planned Start Date"
              name="planned_start_date"
              type="date"
              value={formData.planned_start_date}
              onChange={(e) => setFormData((prev) => ({ ...prev, planned_start_date: e.target.value }))}
            />
            <FormInput
              label="Planned End Date"
              name="planned_end_date"
              type="date"
              value={formData.planned_end_date}
              onChange={(e) => setFormData((prev) => ({ ...prev, planned_end_date: e.target.value }))}
            />
          </div>

          <div>
            <label htmlFor="remarks" className="label">Remarks</label>
            <textarea
              id="remarks"
              name="remarks"
              className="input"
              rows={3}
              value={formData.remarks}
              onChange={(e) => setFormData((prev) => ({ ...prev, remarks: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
