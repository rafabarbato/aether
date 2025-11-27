import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, FolderOpen, Calendar, ChevronRight } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Breadcrumb from '../components/Breadcrumb';
import projectService, { CreateProjectDto, UpdateProjectDto } from '../services/projectService';
import groupService from '../services/groupService';
import { Project, Group } from '../types';

interface ProjectFormProps {
  project?: Project;
  groups: Group[];
  selectedGroupId?: number;
  onSave: (data: CreateProjectDto | UpdateProjectDto) => Promise<void>;
  onCancel: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ project, groups, selectedGroupId, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    groupId: project?.groupId || selectedGroupId || undefined,
    name: project?.name || '',
    description: project?.description || '',
    color: project?.color || '#3B82F6',
    status: project?.status || 'planning' as const,
    startDate: project?.startDate ? project.startDate.split('T')[0] : '',
    endDate: project?.endDate ? project.endDate.split('T')[0] : '',
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-aether-bg-elevated border border-aether-border-elevated w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-aether-border-elevated">
          <h2 className="text-2xl font-bold text-aether-text-primary uppercase tracking-tight">
            {project ? 'Edit Project' : 'New Project'}
          </h2>
          <p className="text-aether-text-muted font-mono text-xs uppercase tracking-widest mt-1">
            {project ? 'Update project details' : 'Create a new project'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-mono text-aether-text-muted uppercase tracking-wider mb-2">
              Group
            </label>
            <select
              value={formData.groupId || ''}
              onChange={(e) => setFormData({ ...formData, groupId: e.target.value ? parseInt(e.target.value) : undefined })}
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
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-3 bg-aether-bg-primary border border-aether-border-elevated text-aether-text-primary font-mono text-sm focus:outline-none focus:border-aether-blue-primary transition-colors"
              placeholder="Enter project name"
            />
          </div>

          <div>
            <label className="block text-sm font-mono text-aether-text-muted uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-aether-bg-primary border border-aether-border-elevated text-aether-text-primary font-mono text-sm focus:outline-none focus:border-aether-blue-primary transition-colors resize-none"
              placeholder="Enter project description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-mono text-aether-text-muted uppercase tracking-wider mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-3 bg-aether-bg-primary border border-aether-border-elevated text-aether-text-primary font-mono text-sm focus:outline-none focus:border-aether-blue-primary transition-colors"
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-mono text-aether-text-muted uppercase tracking-wider mb-2">
                Color
              </label>
              <div className="flex items-center gap-2">
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
                  className="flex-1 px-4 py-3 bg-aether-bg-primary border border-aether-border-elevated text-aether-text-primary font-mono text-sm focus:outline-none focus:border-aether-blue-primary transition-colors"
                  placeholder="#3B82F6"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-mono text-aether-text-muted uppercase tracking-wider mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-3 bg-aether-bg-primary border border-aether-border-elevated text-aether-text-primary font-mono text-sm focus:outline-none focus:border-aether-blue-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-mono text-aether-text-muted uppercase tracking-wider mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-3 bg-aether-bg-primary border border-aether-border-elevated text-aether-text-primary font-mono text-sm focus:outline-none focus:border-aether-blue-primary transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-aether-border-elevated">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-aether-blue-primary text-white font-mono text-xs uppercase tracking-wider hover:bg-aether-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : project ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border border-aether-border-elevated text-aether-text-primary font-mono text-xs uppercase tracking-wider hover:bg-aether-bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('groupId');

  const [projects, setProjects] = useState<Project[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (groupId) {
      loadProjects(parseInt(groupId));
      loadSelectedGroup(parseInt(groupId));
    } else {
      loadProjects();
    }
  }, [groupId]);

  const loadGroups = async () => {
    try {
      const fetchedGroups = await groupService.getAllGroups();
      setGroups(fetchedGroups);
    } catch (error) {
      console.error('Failed to load groups:', error);
    }
  };

  const loadSelectedGroup = async (id: number) => {
    try {
      const group = await groupService.getGroupById(id);
      setSelectedGroup(group);
    } catch (error) {
      console.error('Failed to load group:', error);
    }
  };

  const loadProjects = async (filterGroupId?: number) => {
    try {
      setIsLoading(true);
      const filters = filterGroupId ? { groupId: filterGroupId } : {};
      const fetchedProjects = await projectService.getProjects(filters);
      setProjects(fetchedProjects);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (data: CreateProjectDto) => {
    try {
      await projectService.createProject(data);
      setShowForm(false);
      await loadProjects(groupId ? parseInt(groupId) : undefined);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleUpdate = async (data: UpdateProjectDto) => {
    if (!editingProject) return;
    try {
      await projectService.updateProject(editingProject.id, data);
      setShowForm(false);
      setEditingProject(undefined);
      await loadProjects(groupId ? parseInt(groupId) : undefined);
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await projectService.deleteProject(id);
      await loadProjects(groupId ? parseInt(groupId) : undefined);
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const filteredProjects = searchQuery
    ? projects.filter((project) =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : projects;

  const statusColors = {
    planning: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    on_hold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    archived: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };

  const breadcrumbItems = selectedGroup
    ? [
        { label: 'Groups', path: '/groups' },
        { label: selectedGroup.name },
      ]
    : [{ label: 'All Projects' }];

  return (
    <Layout>
      <div className="p-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="mb-8 flex items-center space-x-4">
          <div className="h-10 w-1 bg-aether-blue-primary"></div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-aether-text-primary uppercase tracking-tight">
              {selectedGroup ? `${selectedGroup.name} - Projects` : 'Projects'}
            </h1>
            <p className="text-aether-text-muted font-mono text-xs uppercase tracking-widest mt-1">
              {selectedGroup ? `Manage projects in ${selectedGroup.name}` : 'Manage all projects'}
            </p>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-aether-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH PROJECTS..."
              className="w-full pl-12 pr-4 py-3 bg-aether-bg-elevated border border-aether-border-elevated text-aether-text-primary font-mono text-sm placeholder:text-aether-text-muted placeholder:text-xs focus:outline-none focus:border-aether-blue-primary transition-colors"
            />
          </div>
          <button
            onClick={() => {
              setEditingProject(undefined);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-aether-blue-primary text-white font-mono text-xs uppercase tracking-wider hover:bg-aether-blue-dark transition-colors"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            New Project
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-aether-text-muted">Loading projects...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-aether-bg-elevated border border-aether-border-elevated rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => navigate(`/milestones?projectId=${project.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: project.color }}
                    >
                      <FolderOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-aether-text-primary">
                        {project.name}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded ${statusColors[project.status]}`}>
                        {project.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {project.description && (
                  <p className="text-sm text-aether-text-muted mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}

                {project.group && (
                  <div className="text-xs text-aether-text-muted mb-3">
                    Group: <span className="font-medium text-aether-text-primary">{project.group.name}</span>
                  </div>
                )}

                {(project.startDate || project.endDate) && (
                  <div className="flex items-center gap-2 text-xs text-aether-text-muted mb-3">
                    <Calendar className="w-3 h-3" />
                    {project.startDate && new Date(project.startDate).toLocaleDateString()}
                    {project.startDate && project.endDate && ' - '}
                    {project.endDate && new Date(project.endDate).toLocaleDateString()}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-aether-border-elevated">
                  <div className="flex items-center gap-2 text-sm text-aether-text-muted">
                    <span>View milestones</span>
                    <ChevronRight className="w-4 h-4 text-aether-blue-primary group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        setEditingProject(project);
                        setShowForm(true);
                      }}
                      className="p-2 hover:bg-aether-bg-primary rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4 text-aether-text-muted" />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="p-2 hover:bg-aether-bg-primary rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 text-aether-text-muted mx-auto mb-4" />
            <p className="text-aether-text-muted text-lg">
              {searchQuery ? 'No projects found' : selectedGroup ? 'No projects in this group yet' : 'No projects yet'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-aether-blue-primary hover:text-aether-blue-dark font-medium"
              >
                Create your first project
              </button>
            )}
          </div>
        )}

        {showForm && (
          <ProjectForm
            project={editingProject}
            groups={groups}
            selectedGroupId={groupId ? parseInt(groupId) : undefined}
            onSave={editingProject ? handleUpdate : handleCreate}
            onCancel={() => {
              setShowForm(false);
              setEditingProject(undefined);
            }}
          />
        )}
      </div>
    </Layout>
  );
};

export default Projects;
