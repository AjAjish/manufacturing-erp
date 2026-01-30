import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { inspectionService } from '../../services/api';
import Card from '../../components/common/Card';
import DataTable from '../../components/common/DataTable';
import StatsCard from '../../components/common/StatsCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function InspectionList() {
  const [inspections, setInspections] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const { user } = useAuth();

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
    } catch (error) {
      console.error('Failed to fetch inspections:', error);
    } finally {
      setLoading(false);
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
        </div>

        {activeTab === 'all' ? (
          <DataTable
            columns={columns}
            data={inspections}
            emptyMessage="No inspection records found"
          />
        ) : (
          <DataTable
            columns={pendingColumns}
            data={pendingApprovals}
            emptyMessage="No pending approvals"
          />
        )}
      </Card>
    </div>
  );
}