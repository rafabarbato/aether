import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Target, Calendar, TrendingUp } from 'lucide-react';
import Layout from '../components/Layout';
import milestoneService, { CreateMilestoneData, UpdateMilestoneData, MilestoneStats } from '../services/milestoneService';
import { Milestone, MilestoneType, MilestoneStatus } from '../types';

interface MilestoneFormProps {
  milestone?: Milestone;
  onSave: (data: CreateMilestoneData | UpdateMilestoneData) => Promise<void>;
  onCancel: () => void;
}

const MilestoneForm: React.FC<MilestoneFormProps> = ({ milestone, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    projectId: milestone?.projectId || 0,
    name: milestone?.name || '',
    description: milestone?.description || '',
    type: milestone?.type || 'milestone' as MilestoneType,
    status: milestone?.status || 'planning' as MilestoneStatus,
    startDate: milestone?.startDate ? milestone.startDate.split('T')[0] : '',
    endDate: milestone?.endDate ? milestone.endDate.split('T')[0] : '',
    iconUrl: milestone?.iconUrl || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const dataToSave = milestone ? { ...formData } : { ...formData, projectId: formData.projectId };
      await onSave(dataToSave as any);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">
            {milestone ? 'Edit Milestone' : 'New Milestone'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!milestone && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                Project ID *
              </label>
              <input
                type="number"
                value={formData.projectId || ''}
                onChange={(e) => setFormData({ ...formData, projectId: parseInt(e.target.value) })}
                required
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Enter project ID"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Enter milestone name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Enter milestone description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as MilestoneType })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="milestone">Milestone</option>
                <option value="sprint">Sprint</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as MilestoneStatus })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
              Icon URL
            </label>
            <input
              type="url"
              value={formData.iconUrl}
              onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="https://example.com/icon.png"
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-sans text-sm font-bold uppercase tracking-wider hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : milestone ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-sans text-sm font-bold uppercase tracking-wider hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Milestones: React.FC = () => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<MilestoneType | ''>('');
  const [filterStatus, setFilterStatus] = useState<MilestoneStatus | ''>('');
  const [showForm, setShowForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | undefined>();

  useEffect(() => {
    loadMilestones();
  }, []);

  const loadMilestones = async () => {
    try {
      setIsLoading(true);
      const fetchedMilestones = await milestoneService.getAllMilestones();
      setMilestones(fetchedMilestones);
    } catch (error) {
      console.error('Failed to load milestones:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (data: CreateMilestoneData) => {
    try {
      await milestoneService.createMilestone(data);
      setShowForm(false);
      await loadMilestones();
    } catch (error) {
      console.error('Failed to create milestone:', error);
    }
  };

  const handleUpdate = async (data: UpdateMilestoneData) => {
    if (!editingMilestone) return;
    try {
      await milestoneService.updateMilestone(editingMilestone.id, data);
      setShowForm(false);
      setEditingMilestone(undefined);
      await loadMilestones();
    } catch (error) {
      console.error('Failed to update milestone:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this milestone?')) return;
    try {
      await milestoneService.deleteMilestone(id);
      await loadMilestones();
    } catch (error) {
      console.error('Failed to delete milestone:', error);
    }
  };

  const getStatusColor = (status: MilestoneStatus) => {
    const colors = {
      planning: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      active: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    return colors[status];
  };

  const filteredMilestones = milestones.filter((milestone) => {
    const matchesSearch = searchQuery === '' ||
      milestone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      milestone.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === '' || milestone.type === filterType;
    const matchesStatus = filterStatus === '' || milestone.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8 flex items-center space-x-4">
          <div className="h-10 w-1 bg-orange-500"></div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">
              Milestones & Sprints
            </h1>
            <p className="text-gray-600 dark:text-gray-400 font-sans text-xs uppercase tracking-widest mt-1">
              Track Project Progress
            </p>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH MILESTONES..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-mono text-sm placeholder:text-gray-400 placeholder:text-xs focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as MilestoneType | '')}
            className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="">All Types</option>
            <option value="milestone">Milestone</option>
            <option value="sprint">Sprint</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as MilestoneStatus | '')}
            className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="">All Statuses</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={() => {
              setEditingMilestone(undefined);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-sans text-xs font-bold uppercase tracking-wider hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            New Milestone
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-gray-500 dark:text-gray-400">Loading milestones...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMilestones.map((milestone) => (
              <div
                key={milestone.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                      {milestone.type === 'sprint' ? (
                        <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                      ) : (
                        <Target className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {milestone.name}
                      </h3>
                      <p className="text-xs uppercase text-gray-500 dark:text-gray-400">
                        {milestone.type}
                      </p>
                    </div>
                  </div>
                </div>

                {milestone.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {milestone.description}
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(milestone.status)}`}>
                    {milestone.status.toUpperCase()}
                  </span>
                  {milestone.startDate && milestone.endDate && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(milestone.startDate).toLocaleDateString()} - {new Date(milestone.endDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setEditingMilestone(milestone);
                      setShowForm(true);
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(milestone.id)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filteredMilestones.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {searchQuery || filterType || filterStatus ? 'No milestones found' : 'No milestones yet'}
            </p>
            {!searchQuery && !filterType && !filterStatus && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-orange-500 hover:text-orange-600 font-medium"
              >
                Create your first milestone
              </button>
            )}
          </div>
        )}

        {showForm && (
          <MilestoneForm
            milestone={editingMilestone}
            onSave={editingMilestone ? handleUpdate : handleCreate}
            onCancel={() => {
              setShowForm(false);
              setEditingMilestone(undefined);
            }}
          />
        )}
      </div>
    </Layout>
  );
};

export default Milestones;
