import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, useDraggable, useDroppable, DragStartEvent } from '@dnd-kit/core';
import { ExternalLink, Search, Filter as FilterIcon, Plus, Edit2, Trash2 } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Breadcrumb from '../components/Breadcrumb';
import TaskFormModal from '../components/TaskFormModal';
import TaskDetailModal from '../components/TaskDetailModal';
import taskService from '../services/taskService';
import milestoneService from '../services/milestoneService';
import projectService from '../services/projectService';
import groupService from '../services/groupService';
import { Task, TaskStatus, Milestone, Project, Group } from '../types';

interface KanbanColumn {
  id: TaskStatus;
  title: string;
  color: string;
}

const COLUMNS: KanbanColumn[] = [
  { id: 'ready', title: 'READY', color: '#6B7280' },
  { id: 'in_progress', title: 'IN PROGRESS', color: '#3B82F6' },
  { id: 'in_review', title: 'IN REVIEW', color: '#F59E0B' },
  { id: 'done', title: 'DONE', color: '#10B981' },
];

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onClick?: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, isDragging = false, onEdit, onDelete, onClick }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `task-${task.id}`,
    data: { task },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-all hover:shadow-md group ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      {/* Header with drag handle and actions */}
      <div className="flex items-start justify-between mb-2">
        <div
          {...listeners}
          {...attributes}
          className="flex-1 cursor-grab active:cursor-grabbing"
          onClick={(e) => {
            // Only open detail if not dragging
            if (!isDragging && onClick) {
              onClick(task);
            }
          }}
        >
          {/* Task Title */}
          <div className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {task.title}
          </div>
        </div>

        {/* Action buttons - visible on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Edit task"
            >
              <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task);
              }}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
            </button>
          )}
        </div>
      </div>

      {/* Task Description */}
      {task.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Priority Badge */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            priorityColors[task.priority]
          }`}
        >
          {task.priority.toUpperCase()}
        </span>
        {task.tagLabel && (
          <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
            {task.tagLabel}
          </span>
        )}
      </div>

      {/* Assignee */}
      {task.assignee && (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
          {task.assignee.photoUrl ? (
            <img
              src={task.assignee.photoUrl}
              alt={task.assignee.username}
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs">
              {task.assignee.firstName[0]}
            </div>
          )}
          <span>
            {task.assignee.firstName} {task.assignee.lastName}
          </span>
        </div>
      )}

      {/* Due Date */}
      {task.dueDate && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Due: {new Date(task.dueDate).toLocaleDateString()}
        </div>
      )}

      {/* Estimated Hours */}
      {task.estimatedHours && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Est: {task.estimatedHours}h
        </div>
      )}
    </div>
  );
};

interface KanbanColumnProps {
  column: KanbanColumn;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onTaskClick: (task: Task) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, tasks, onEdit, onDelete, onTaskClick }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 rounded-lg">
      {/* Column Header */}
      <div
        className="flex items-center justify-between p-4 border-b-2"
        style={{ borderColor: column.color }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: column.color }}
          />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
            {column.title}
          </h3>
        </div>
        <div className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded">
          {tasks.length}
        </div>
      </div>

      {/* Column Content */}
      <div
        ref={setNodeRef}
        className={`flex-1 p-4 space-y-3 overflow-y-auto transition-colors ${
          isOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''
        }`}
      >
        {tasks.length === 0 ? (
          <div className="text-xs text-gray-400 dark:text-gray-600 text-center py-8">
            No tasks
          </div>
        ) : (
          tasks.map((task) => <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} onClick={onTaskClick} />)
        )}
      </div>
    </div>
  );
};

const KanbanBoard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const milestoneId = searchParams.get('milestoneId');

  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    if (milestoneId) {
      loadMilestone(parseInt(milestoneId));
      loadTasks(parseInt(milestoneId));
    } else {
      loadTasks();
    }
  }, [milestoneId]);

  const loadMilestone = async (id: number) => {
    try {
      const milestone = await milestoneService.getMilestoneById(id);
      setSelectedMilestone(milestone);
      if (milestone.projectId) {
        const project = await projectService.getProjectById(milestone.projectId);
        setSelectedProject(project);
        if (project.groupId) {
          const group = await groupService.getGroupById(project.groupId);
          setSelectedGroup(group);
        }
      }
    } catch (error) {
      console.error('Failed to load milestone:', error);
    }
  };

  const loadTasks = async (filterMilestoneId?: number) => {
    try {
      setIsLoading(true);
      const filters = filterMilestoneId ? { milestoneId: filterMilestoneId } : {};
      const fetchedTasks = await taskService.getTasks(filters);
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = event.active.data.current?.task as Task | undefined;
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = parseInt(active.id.toString().replace('task-', ''));
    const newStatus = over.id as TaskStatus;
    const task = tasks.find((t) => t.id === taskId);

    if (!task || task.status === newStatus) return;

    // Optimistic update
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id === taskId ? { ...t, status: newStatus } : t
      )
    );

    try {
      await taskService.updateTaskStatus(taskId, newStatus);
    } catch (error) {
      console.error('Failed to update task status:', error);
      // Revert on error
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === taskId ? { ...t, status: task.status } : t
        )
      );
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (task: Task) => {
    if (!confirm(`Are you sure you want to delete "${task.title}"?`)) return;

    try {
      await taskService.deleteTask(task.id);
      await loadTasks(milestoneId ? parseInt(milestoneId) : undefined);
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  const filteredTasks = searchQuery
    ? tasks.filter((task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tasks;

  const breadcrumbItems = [];
  if (selectedGroup) {
    breadcrumbItems.push({ label: 'Groups', path: '/groups' });
    breadcrumbItems.push({ label: selectedGroup.name, path: `/projects?groupId=${selectedGroup.id}` });
  }
  if (selectedProject) {
    breadcrumbItems.push({ label: selectedProject.name, path: `/milestones?projectId=${selectedProject.id}` });
  }
  if (selectedMilestone) {
    breadcrumbItems.push({ label: selectedMilestone.name });
  }
  if (!selectedMilestone && !selectedProject && !selectedGroup) {
    breadcrumbItems.push({ label: 'All Tasks' });
  }

  return (
    <Layout>
      <div className="p-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="mb-8 flex items-center space-x-4">
          <div className="h-10 w-1 bg-aether-blue-primary"></div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-aether-text-primary uppercase tracking-tight">
              {selectedMilestone ? `${selectedMilestone.name} - Tasks` : 'Task Board'}
            </h1>
            <p className="text-aether-text-muted font-sans text-[10px] uppercase tracking-widest mt-1">
              {selectedMilestone ? `Manage tasks in ${selectedMilestone.name}` : 'Manage Tasks with Drag and Drop'}
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
              placeholder="SEARCH TASKS..."
              className="w-full pl-12 pr-4 py-3 bg-aether-bg-elevated border border-aether-border-elevated text-aether-text-primary font-mono text-sm placeholder:text-aether-text-muted placeholder:text-xs focus:outline-none focus:border-aether-blue-primary transition-colors"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-aether-blue-primary text-white font-sans text-xs font-bold uppercase tracking-wider hover:bg-aether-blue-dark transition-colors"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            New Task
          </button>
        </div>

      {/* Kanban Board */}
      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500 dark:text-gray-400">Loading tasks...</div>
        </div>
      ) : (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-[calc(100vh-280px)]">
            {COLUMNS.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={getTasksByStatus(column.id)}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onTaskClick={handleTaskClick}
              />
            ))}
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeTask ? (
              <div className="opacity-80">
                <TaskCard task={activeTask} isDragging />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Task Form Modal */}
      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(undefined);
        }}
        onSuccess={() => loadTasks(milestoneId ? parseInt(milestoneId) : undefined)}
        projectId={selectedProject?.id || undefined}
        milestoneId={selectedMilestone?.id || undefined}
        task={editingTask}
      />

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedTask(null);
          }}
          onTaskUpdate={() => loadTasks(milestoneId ? parseInt(milestoneId) : undefined)}
        />
      )}
      </div>
    </Layout>
  );
};

export default KanbanBoard;
