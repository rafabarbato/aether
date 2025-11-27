import React, { useState, useEffect } from 'react';
import { X, Calendar, Tag, Users, Clock, FolderOpen } from 'lucide-react';
import taskService, { CreateTaskDto, UpdateTaskDto } from '../services/taskService';
import userService from '../services/userService';
import groupService from '../services/groupService';
import projectService from '../services/projectService';
import milestoneService from '../services/milestoneService';
import { User, Group, Project, Milestone, TaskPriority, Task } from '../types';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId?: number;
  milestoneId?: number;
  task?: Task;
}

const PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'text-gray-600' },
  { value: 'medium', label: 'Medium', color: 'text-blue-600' },
  { value: 'high', label: 'High', color: 'text-orange-600' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-600' },
];

const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  projectId,
  milestoneId,
  task,
}) => {
  const [formData, setFormData] = useState<Partial<CreateTaskDto>>({
    projectId: projectId || task?.projectId || 0,
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    status: task?.status || 'ready',
    estimatedHours: task?.estimatedHours || undefined,
    dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
    tagLabel: task?.tagLabel || '',
  });
  const [assignees, setAssignees] = useState<number[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset form data when task changes
      if (task) {
        setFormData({
          projectId: task.projectId,
          title: task.title,
          description: task.description || '',
          priority: task.priority,
          status: task.status,
          estimatedHours: task.estimatedHours || undefined,
          dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
          tagLabel: task.tagLabel || '',
        });
        setAssignees(task.assignees?.map(a => a.id) || []);
      } else {
        setFormData({
          projectId: projectId || 0,
          milestoneId: milestoneId,
          title: '',
          description: '',
          priority: 'medium',
          status: 'ready',
          estimatedHours: undefined,
          dueDate: '',
          tagLabel: '',
        });
        setAssignees([]);
      }
      loadFormData();
    }
  }, [isOpen, task, projectId, milestoneId]);

  const loadFormData = async () => {
    try {
      setIsLoadingData(true);
      setError(null);

      // Load users, groups, and projects in parallel
      const [usersData, groupsData, projectsData] = await Promise.all([
        userService.getUsers({ isActive: true }),
        groupService.getAllGroups(),
        projectService.getProjects(),
      ]);

      setUsers(usersData);
      setGroups(groupsData);
      setProjects(projectsData);

      // Load milestones only if projectId is provided
      const effectiveProjectId = task?.projectId || projectId;
      if (effectiveProjectId) {
        const milestonesData = await milestoneService.getAllMilestones({ projectId: effectiveProjectId });
        setMilestones(milestonesData);
      } else {
        setMilestones([]);
      }
    } catch (err: any) {
      console.error('Failed to load form data:', err);
      setError(err.response?.data?.message || 'Failed to load form data. Please try again.');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleProjectChange = async (newProjectId: number | undefined) => {
    setFormData({ ...formData, projectId: newProjectId || 0, milestoneId: undefined });

    // Load milestones for the selected project
    if (newProjectId) {
      try {
        const milestonesData = await milestoneService.getAllMilestones({ projectId: newProjectId });
        setMilestones(milestonesData);
      } catch (err) {
        console.error('Failed to load milestones:', err);
        setMilestones([]);
      }
    } else {
      setMilestones([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title || !formData.projectId) {
      setError('Title and Project are required');
      return;
    }

    try {
      setIsLoading(true);
      if (task) {
        // Update existing task
        await taskService.updateTask(task.id, {
          ...formData,
          assignees,
        } as UpdateTaskDto & { assignees: number[] });
      } else {
        // Create new task
        await taskService.createTask({
          ...formData,
          assignees,
        } as CreateTaskDto & { assignees: number[] });
      }
      onSuccess();
      handleClose();
    } catch (err: any) {
      console.error(`Failed to ${task ? 'update' : 'create'} task:`, err);
      setError(err.response?.data?.message || `Failed to ${task ? 'update' : 'create'} task`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      projectId: projectId || 0,
      title: '',
      description: '',
      priority: 'medium',
      status: 'ready',
      estimatedHours: undefined,
      dueDate: '',
      tagLabel: '',
    });
    setAssignees([]);
    setError(null);
    onClose();
  };

  const toggleAssignee = (userId: number) => {
    setAssignees((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-aether-bg-elevated border border-aether-border-elevated max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-aether-border-elevated">
          <div>
            <h2 className="text-xl font-bold text-aether-text-primary uppercase tracking-tight">
              {task ? 'Edit Task' : 'Create New Task'}
            </h2>
            <p className="text-aether-text-muted font-mono text-xs uppercase tracking-widest mt-1">
              {task ? 'Update task details' : 'Fill in the task details'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-aether-text-muted hover:text-aether-text-primary transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {isLoadingData ? (
            <div className="text-center py-8 text-aether-text-muted">
              Loading form data...
            </div>
          ) : (
            <>
              {/* Title */}
              <div>
                <label className="block text-sm font-mono text-aether-text-muted uppercase tracking-wider mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-aether-bg-primary border border-aether-border-elevated text-aether-text-primary font-mono text-sm focus:outline-none focus:border-aether-blue-primary transition-colors"
                  placeholder="Enter task title"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-mono text-aether-text-muted uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 bg-aether-bg-primary border border-aether-border-elevated text-aether-text-primary font-mono text-sm focus:outline-none focus:border-aether-blue-primary transition-colors resize-none"
                  placeholder="Enter task description"
                />
              </div>

              {/* Project */}
              <div>
                <label className="block text-sm font-mono text-aether-text-muted uppercase tracking-wider mb-2">
                  <FolderOpen className="w-4 h-4 inline mr-2" />
                  Project *
                </label>
                <select
                  value={formData.projectId || ''}
                  onChange={(e) =>
                    handleProjectChange(e.target.value ? parseInt(e.target.value) : undefined)
                  }
                  className="w-full px-4 py-3 bg-aether-bg-primary border border-aether-border-elevated text-aether-text-primary font-mono text-sm focus:outline-none focus:border-aether-blue-primary transition-colors"
                  required
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Group and Milestone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-mono text-aether-text-muted uppercase tracking-wider mb-2">
                    <Tag className="w-4 h-4 inline mr-2" />
                    Group
                  </label>
                  <select
                    value={formData.groupId || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        groupId: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-4 py-3 bg-aether-bg-primary border border-aether-border-elevated text-aether-text-primary font-mono text-sm focus:outline-none focus:border-aether-blue-primary transition-colors"
                  >
                    <option value="">No Group</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-mono text-aether-text-muted uppercase tracking-wider mb-2">
                    <Tag className="w-4 h-4 inline mr-2" />
                    Milestone
                  </label>
                  <select
                    value={formData.milestoneId || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        milestoneId: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-4 py-3 bg-aether-bg-primary border border-aether-border-elevated text-aether-text-primary font-mono text-sm focus:outline-none focus:border-aether-blue-primary transition-colors"
                  >
                    <option value="">No Milestone</option>
                    {milestones.map((milestone) => (
                      <option key={milestone.id} value={milestone.id}>
                        {milestone.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Priority and Due Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-mono text-aether-text-muted uppercase tracking-wider mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: e.target.value as TaskPriority,
                      })
                    }
                    className="w-full px-4 py-3 bg-aether-bg-primary border border-aether-border-elevated text-aether-text-primary font-mono text-sm focus:outline-none focus:border-aether-blue-primary transition-colors"
                  >
                    {PRIORITIES.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-mono text-aether-text-muted uppercase tracking-wider mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-aether-bg-primary border border-aether-border-elevated text-aether-text-primary font-mono text-sm focus:outline-none focus:border-aether-blue-primary transition-colors"
                  />
                </div>
              </div>

              {/* Estimated Hours and Tag */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-mono text-aether-text-muted uppercase tracking-wider mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.estimatedHours || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estimatedHours: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-4 py-3 bg-aether-bg-primary border border-aether-border-elevated text-aether-text-primary font-mono text-sm focus:outline-none focus:border-aether-blue-primary transition-colors"
                    placeholder="0.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-mono text-aether-text-muted uppercase tracking-wider mb-2">
                    Tag
                  </label>
                  <input
                    type="text"
                    value={formData.tagLabel || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, tagLabel: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-aether-bg-primary border border-aether-border-elevated text-aether-text-primary font-mono text-sm focus:outline-none focus:border-aether-blue-primary transition-colors"
                    placeholder="e.g., frontend, bug"
                    maxLength={50}
                  />
                </div>
              </div>

              {/* Assignees */}
              <div>
                <label className="block text-sm font-mono text-aether-text-muted uppercase tracking-wider mb-3">
                  <Users className="w-4 h-4 inline mr-2" />
                  Assign To
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto bg-aether-bg-primary border border-aether-border-elevated p-3">
                  {users.length === 0 ? (
                    <p className="text-aether-text-muted text-sm">No users available</p>
                  ) : (
                    users.map((user) => (
                      <label
                        key={user.id}
                        className="flex items-center gap-3 p-2 hover:bg-aether-bg-elevated cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={assignees.includes(user.id)}
                          onChange={() => toggleAssignee(user.id)}
                          className="w-4 h-4 text-aether-blue-primary focus:ring-aether-blue-primary"
                        />
                        <div className="flex items-center gap-2 flex-1">
                          {user.photoUrl ? (
                            <img
                              src={user.photoUrl}
                              alt={user.username}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-aether-blue-primary flex items-center justify-center text-white text-sm font-bold">
                              {user.firstName[0]}
                            </div>
                          )}
                          <div>
                            <div className="text-sm text-aether-text-primary font-medium">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-xs text-aether-text-muted">
                              @{user.username}
                            </div>
                          </div>
                        </div>
                      </label>
                    ))
                  )}
                </div>
                {assignees.length > 0 && (
                  <p className="text-xs text-aether-text-muted mt-2">
                    {assignees.length} user{assignees.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-aether-border-elevated">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 border border-aether-border-elevated text-aether-text-primary font-mono text-xs uppercase tracking-wider hover:bg-aether-bg-primary transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || isLoadingData}
              className="px-6 py-3 bg-aether-blue-primary text-white font-mono text-xs uppercase tracking-wider hover:bg-aether-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (task ? 'Updating...' : 'Creating...') : (task ? 'Update Task' : 'Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskFormModal;
