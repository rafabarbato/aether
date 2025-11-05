import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, Target, CheckSquare, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import Layout from '../components/Layout';
import groupService from '../services/groupService';
import milestoneService from '../services/milestoneService';
import taskService from '../services/taskService';
import { Group, Milestone, Task } from '../types';

interface Stats {
  totalGroups: number;
  activeGroups: number;
  totalMilestones: number;
  activeMilestones: number;
  totalTasks: number;
  tasksByStatus: {
    ready: number;
    inProgress: number;
    inReview: number;
    done: number;
  };
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalGroups: 0,
    activeGroups: 0,
    totalMilestones: 0,
    activeMilestones: 0,
    totalTasks: 0,
    tasksByStatus: {
      ready: 0,
      inProgress: 0,
      inReview: 0,
      done: 0,
    },
  });
  const [recentGroups, setRecentGroups] = useState<Group[]>([]);
  const [recentMilestones, setRecentMilestones] = useState<Milestone[]>([]);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      const [groups, milestones, tasks] = await Promise.all([
        groupService.getAllGroups(),
        milestoneService.getAllMilestones(),
        taskService.getTasks({}),
      ]);

      // Calculate stats
      const activeGroups = groups.filter((g) => g.isActive).length;
      const activeMilestones = milestones.filter((m) => m.status === 'active').length;

      const tasksByStatus = {
        ready: tasks.filter((t) => t.status === 'ready').length,
        inProgress: tasks.filter((t) => t.status === 'in_progress').length,
        inReview: tasks.filter((t) => t.status === 'in_review').length,
        done: tasks.filter((t) => t.status === 'done').length,
      };

      setStats({
        totalGroups: groups.length,
        activeGroups,
        totalMilestones: milestones.length,
        activeMilestones,
        totalTasks: tasks.length,
        tasksByStatus,
      });

      // Get recent items (last 5)
      setRecentGroups(groups.slice(0, 5));
      setRecentMilestones(milestones.slice(0, 5));
      setRecentTasks(tasks.slice(0, 5));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: number;
    subtitle?: string;
    color: string;
    link: string;
  }> = ({ icon, title, value, subtitle, color, link }) => (
    <Link
      to={link}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-all"
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}
        >
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white font-mono">
            {value}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide font-sans">
            {title}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </Link>
  );

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8 flex items-center space-x-4">
          <div className="h-10 w-1 bg-blue-600"></div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 font-sans text-xs uppercase tracking-widest mt-1">
              Overview of Your Workspace
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-gray-500 dark:text-gray-400">Loading dashboard...</div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <StatCard
                icon={<FolderOpen className="w-6 h-6 text-white" />}
                title="Groups"
                value={stats.totalGroups}
                subtitle={`${stats.activeGroups} active`}
                color="bg-blue-600"
                link="/groups"
              />
              <StatCard
                icon={<Target className="w-6 h-6 text-white" />}
                title="Milestones"
                value={stats.totalMilestones}
                subtitle={`${stats.activeMilestones} active`}
                color="bg-orange-500"
                link="/milestones"
              />
              <StatCard
                icon={<CheckSquare className="w-6 h-6 text-white" />}
                title="Total Tasks"
                value={stats.totalTasks}
                color="bg-purple-600"
                link="/tasks"
              />
            </div>

            {/* Task Status Breakdown */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight mb-6">
                Task Status Overview
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-600 dark:text-gray-400 font-mono">
                    {stats.tasksByStatus.ready}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-500 uppercase tracking-wide mt-2">
                    Ready
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2">
                    <div
                      className="h-full bg-gray-500 rounded-full"
                      style={{
                        width: `${
                          stats.totalTasks > 0
                            ? (stats.tasksByStatus.ready / stats.totalTasks) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 font-mono">
                    {stats.tasksByStatus.inProgress}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-500 uppercase tracking-wide mt-2">
                    In Progress
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${
                          stats.totalTasks > 0
                            ? (stats.tasksByStatus.inProgress / stats.totalTasks) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 font-mono">
                    {stats.tasksByStatus.inReview}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-500 uppercase tracking-wide mt-2">
                    In Review
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2">
                    <div
                      className="h-full bg-orange-500 rounded-full"
                      style={{
                        width: `${
                          stats.totalTasks > 0
                            ? (stats.tasksByStatus.inReview / stats.totalTasks) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 font-mono">
                    {stats.tasksByStatus.done}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-500 uppercase tracking-wide mt-2">
                    Done
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{
                        width: `${
                          stats.totalTasks > 0
                            ? (stats.tasksByStatus.done / stats.totalTasks) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Items */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Groups */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                    Recent Groups
                  </h2>
                  <Link
                    to="/groups"
                    className="text-xs text-blue-600 hover:text-blue-700 uppercase tracking-wide"
                  >
                    View All
                  </Link>
                </div>
                <div className="space-y-3">
                  {recentGroups.length > 0 ? (
                    recentGroups.map((group) => (
                      <div
                        key={group.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded"
                      >
                        <div
                          className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: group.color }}
                        >
                          <FolderOpen className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {group.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {group.projectCount || 0} projects
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No groups yet
                    </p>
                  )}
                </div>
              </div>

              {/* Recent Milestones */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                    Recent Milestones
                  </h2>
                  <Link
                    to="/milestones"
                    className="text-xs text-orange-500 hover:text-orange-600 uppercase tracking-wide"
                  >
                    View All
                  </Link>
                </div>
                <div className="space-y-3">
                  {recentMilestones.length > 0 ? (
                    recentMilestones.map((milestone) => (
                      <div
                        key={milestone.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded"
                      >
                        <div className="w-8 h-8 rounded bg-orange-100 dark:bg-orange-900 flex items-center justify-center flex-shrink-0">
                          <Target className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {milestone.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                            {milestone.type} • {milestone.status}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No milestones yet
                    </p>
                  )}
                </div>
              </div>

              {/* Recent Tasks */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                    Recent Tasks
                  </h2>
                  <Link
                    to="/tasks"
                    className="text-xs text-purple-600 hover:text-purple-700 uppercase tracking-wide"
                  >
                    View All
                  </Link>
                </div>
                <div className="space-y-3">
                  {recentTasks.length > 0 ? (
                    recentTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded"
                      >
                        <div className="w-8 h-8 rounded bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                          <CheckSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {task.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                            {task.status} • {task.priority}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No tasks yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
