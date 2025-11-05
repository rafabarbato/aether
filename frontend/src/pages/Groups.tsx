import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, FolderOpen, CheckCircle, XCircle } from 'lucide-react';
import Layout from '../components/Layout';
import groupService, { CreateGroupData, UpdateGroupData } from '../services/groupService';
import { Group } from '../types';

interface GroupFormProps {
  group?: Group;
  onSave: (data: CreateGroupData | UpdateGroupData) => Promise<void>;
  onCancel: () => void;
}

const GroupForm: React.FC<GroupFormProps> = ({ group, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: group?.name || '',
    description: group?.description || '',
    color: group?.color || '#3B82F6',
    iconUrl: group?.iconUrl || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">
            {group ? 'Edit Group' : 'New Group'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              placeholder="Enter group name"
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
              placeholder="Enter group description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
              Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-12 h-12 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="#3B82F6"
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
              {isSubmitting ? 'Saving...' : group ? 'Update' : 'Create'}
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

const Groups: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | undefined>();

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setIsLoading(true);
      const fetchedGroups = await groupService.getGroupsWithProjectCount();
      setGroups(fetchedGroups);
    } catch (error) {
      console.error('Failed to load groups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (data: CreateGroupData) => {
    try {
      await groupService.createGroup(data);
      setShowForm(false);
      await loadGroups();
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  const handleUpdate = async (data: UpdateGroupData) => {
    if (!editingGroup) return;
    try {
      await groupService.updateGroup(editingGroup.id, data);
      setShowForm(false);
      setEditingGroup(undefined);
      await loadGroups();
    } catch (error) {
      console.error('Failed to update group:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this group?')) return;
    try {
      await groupService.deleteGroup(id);
      await loadGroups();
    } catch (error) {
      console.error('Failed to delete group:', error);
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await groupService.toggleGroupStatus(id);
      await loadGroups();
    } catch (error) {
      console.error('Failed to toggle group status:', error);
    }
  };

  const filteredGroups = searchQuery
    ? groups.filter((group) =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : groups;

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8 flex items-center space-x-4">
          <div className="h-10 w-1 bg-blue-600"></div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">
              Groups
            </h1>
            <p className="text-gray-600 dark:text-gray-400 font-sans text-xs uppercase tracking-widest mt-1">
              Organize Projects into Groups
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
              placeholder="SEARCH GROUPS..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-mono text-sm placeholder:text-gray-400 placeholder:text-xs focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <button
            onClick={() => {
              setEditingGroup(undefined);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-sans text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            New Group
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-gray-500 dark:text-gray-400">Loading groups...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGroups.map((group) => (
              <div
                key={group.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: group.color }}
                    >
                      {group.iconUrl ? (
                        <img src={group.iconUrl} alt={group.name} className="w-8 h-8" />
                      ) : (
                        <FolderOpen className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {group.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        {group.isActive ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-red-500" />
                            Inactive
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {group.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {group.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-mono font-bold">{group.projectCount || 0}</span> projects
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(group.id)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      title={group.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {group.isActive ? (
                        <XCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setEditingGroup(group);
                        setShowForm(true);
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(group.id)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filteredGroups.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {searchQuery ? 'No groups found' : 'No groups yet'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Create your first group
              </button>
            )}
          </div>
        )}

        {showForm && (
          <GroupForm
            group={editingGroup}
            onSave={editingGroup ? handleUpdate : handleCreate}
            onCancel={() => {
              setShowForm(false);
              setEditingGroup(undefined);
            }}
          />
        )}
      </div>
    </Layout>
  );
};

export default Groups;
