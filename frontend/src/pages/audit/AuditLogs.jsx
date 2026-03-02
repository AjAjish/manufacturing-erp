import React, { useEffect, useMemo, useState } from 'react';
import { ShieldCheckIcon, UserGroupIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { auditService } from '../../services/api';
import Card from '../../components/common/Card';
import DataTable from '../../components/common/DataTable';
import StatsCard from '../../components/common/StatsCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import FormSelect from '../../components/forms/FormSelect';
import FormInput from '../../components/forms/FormInput';
import toast from 'react-hot-toast';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('logs');
  const [filterType, setFilterType] = useState('all');
  const [filterValue, setFilterValue] = useState('');
  const [days, setDays] = useState('30');

  useEffect(() => {
    fetchAuditData();
  }, []);

  const fetchAuditData = async () => {
    try {
      setLoading(true);
      const [logsRes, activitiesRes, statsRes] = await Promise.all([
        auditService.getLogs(),
        auditService.getActivities(),
        auditService.getStatistics(30),
      ]);

      setLogs(logsRes.data.results || logsRes.data || []);
      setActivities(activitiesRes.data.results || activitiesRes.data || []);
      setStats(statsRes.data || null);
    } catch (error) {
      toast.error('Failed to load audit data');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = async () => {
    try {
      setLoading(true);

      let logsRes;
      if (filterType === 'by_user' && filterValue) {
        logsRes = await auditService.getLogsByUser(filterValue);
      } else if (filterType === 'by_model' && filterValue) {
        logsRes = await auditService.getLogsByModel(filterValue);
      } else if (filterType === 'by_object' && filterValue) {
        logsRes = await auditService.getLogsByObject(filterValue);
      } else {
        logsRes = await auditService.getLogs();
      }

      const statsRes = await auditService.getStatistics(days);
      setLogs(logsRes.data.results || logsRes.data || []);
      setStats(statsRes.data || null);
    } catch (error) {
      toast.error('Failed to apply audit filters');
    } finally {
      setLoading(false);
    }
  };

  const totalActions = useMemo(() => {
    if (!stats?.actions_by_type) return logs.length;
    return stats.actions_by_type.reduce((sum, item) => sum + (item.count || 0), 0);
  }, [stats, logs.length]);

  const totalModels = useMemo(() => {
    if (!stats?.actions_by_model) return 0;
    return stats.actions_by_model.length;
  }, [stats]);

  const logsColumns = [
    { key: 'created_at', label: 'Time' },
    { key: 'user_email', label: 'User' },
    { key: 'action_display', label: 'Action' },
    { key: 'model_name', label: 'Model' },
    { key: 'object_id', label: 'Object ID' },
    { key: 'ip_address', label: 'IP Address' },
  ];

  const activitiesColumns = [
    { key: 'created_at', label: 'Time' },
    { key: 'user_email', label: 'User' },
    { key: 'activity_type', label: 'Activity' },
    { key: 'description', label: 'Description' },
    { key: 'ip_address', label: 'IP Address' },
  ];

  if (loading) {
    return <LoadingSpinner size="lg" className="py-12" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-accent-900 dark:text-white">Audit & Activities</h1>
        <p className="mt-1 text-sm text-accent-600 dark:text-accent-400">Monitor system audit logs and user activities</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatsCard title="Total Actions" value={totalActions} icon={ShieldCheckIcon} color="primary" />
        <StatsCard title="Active Models" value={totalModels} icon={DocumentTextIcon} color="blue" />
        <StatsCard title="User Activities" value={activities.length} icon={UserGroupIcon} color="green" />
      </div>

      <Card title="Filters" actions={<button type="button" className="btn-primary" onClick={handleApplyFilters}>Apply</button>}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <FormSelect
            label="Filter"
            name="filterType"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            options={[
              { value: 'all', label: 'All Logs' },
              { value: 'by_user', label: 'By User ID' },
              { value: 'by_model', label: 'By Model Name' },
              { value: 'by_object', label: 'By Object ID' },
            ]}
          />
          <FormInput
            label="Filter Value"
            name="filterValue"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            placeholder="Enter value"
          />
          <FormInput
            label="Statistics Days"
            name="days"
            type="number"
            min="1"
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />
        </div>
      </Card>

      <Card>
        <div className="flex space-x-3 border-b border-accent-100 dark:border-accent-800/50 pb-4 mb-4">
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'logs'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                : 'text-accent-600 hover:text-accent-900 dark:text-accent-300'
            }`}
          >
            Audit Logs ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'activities'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                : 'text-accent-600 hover:text-accent-900 dark:text-accent-300'
            }`}
          >
            Activities ({activities.length})
          </button>
        </div>

        {activeTab === 'logs' ? (
          <DataTable columns={logsColumns} data={logs} emptyMessage="No audit logs found" />
        ) : (
          <DataTable columns={activitiesColumns} data={activities} emptyMessage="No activities found" />
        )}
      </Card>
    </div>
  );
}
