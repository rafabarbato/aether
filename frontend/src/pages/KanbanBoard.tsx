import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, useDraggable, useDroppable, DragStartEvent } from '@dnd-kit/core';
import { ExternalLink, Search, Filter as FilterIcon, Plus } from 'lucide-react';
import Layout from '../components/Layout';
import TaskFormModal from '../components/TaskFormModal';
import taskService from '../services/taskService';
import { Task, TaskStatus } from '../types';

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
}

const TaskCard: React.FC<TaskCardProps> = ({ task, isDragging = false }) => {
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
      {...listeners}
      {...attributes}
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      {/* Task Title */}
      <div className="font-semibold text-gray-900 dark:text-white mb-2">
        {task.title}
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
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, tasks }) => {
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
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
};

const KanbanBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadTasks();
  }, [selectedProject]);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const filters = selectedProject ? { projectId: selectedProject } : {};
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

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  const filteredTasks = searchQuery
    ? tasks.filter((task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tasks;

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8 flex items-center space-x-4">
          <div className="h-10 w-1 bg-aether-blue-primary"></div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-aether-text-primary uppercase tracking-tight">
              Task Board
            </h1>
            <p className="text-aether-text-muted font-sans text-[10px] uppercase tracking-widest mt-1">
              Manage Tasks with Drag and Drop
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
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadTasks}
        projectId={selectedProject || undefined}
      />
      </div>
    </Layout>
  );
};

export default KanbanBoard;
