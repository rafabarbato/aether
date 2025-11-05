import User from './User';
import Team from './Team';
import Group from './Group';
import Project from './Project';
import Milestone from './Milestone';
import Task from './Task';
import Comment from './Comment';
import Attachment from './Attachment';
import Notification from './Notification';

// User <-> Team (Many-to-Many through user_team_assignments)
User.belongsToMany(Team, {
  through: 'user_team_assignments',
  foreignKey: 'user_id',
  otherKey: 'team_id',
  as: 'teams',
});

Team.belongsToMany(User, {
  through: 'user_team_assignments',
  foreignKey: 'team_id',
  otherKey: 'user_id',
  as: 'members',
});

// Project <-> User (One-to-Many: Project owner)
Project.belongsTo(User, {
  foreignKey: 'owner_id',
  as: 'owner',
});

User.hasMany(Project, {
  foreignKey: 'owner_id',
  as: 'ownedProjects',
});

// Project <-> Team (One-to-Many)
Project.belongsTo(Team, {
  foreignKey: 'team_id',
  as: 'team',
});

Team.hasMany(Project, {
  foreignKey: 'team_id',
  as: 'projects',
});

// Task <-> Project (One-to-Many)
Task.belongsTo(Project, {
  foreignKey: 'project_id',
  as: 'project',
});

Project.hasMany(Task, {
  foreignKey: 'project_id',
  as: 'tasks',
});

// Task <-> User (Many-to-One: assigned_to)
Task.belongsTo(User, {
  foreignKey: 'assigned_to',
  as: 'assignee',
});

User.hasMany(Task, {
  foreignKey: 'assigned_to',
  as: 'assignedTasks',
});

// Task <-> User (Many-to-One: created_by)
Task.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator',
});

User.hasMany(Task, {
  foreignKey: 'created_by',
  as: 'createdTasks',
});

// Comment <-> Task (One-to-Many)
Comment.belongsTo(Task, {
  foreignKey: 'task_id',
  as: 'task',
});

Task.hasMany(Comment, {
  foreignKey: 'task_id',
  as: 'comments',
});

// Comment <-> User (Many-to-One)
Comment.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'author',
});

User.hasMany(Comment, {
  foreignKey: 'user_id',
  as: 'comments',
});

// Comment <-> Comment (Self-referencing for replies)
Comment.belongsTo(Comment, {
  foreignKey: 'parent_id',
  as: 'parent',
});

Comment.hasMany(Comment, {
  foreignKey: 'parent_id',
  as: 'replies',
});

// Attachment <-> Task (One-to-Many)
Attachment.belongsTo(Task, {
  foreignKey: 'task_id',
  as: 'task',
});

Task.hasMany(Attachment, {
  foreignKey: 'task_id',
  as: 'attachments',
});

// Attachment <-> User (Many-to-One)
Attachment.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'uploader',
});

User.hasMany(Attachment, {
  foreignKey: 'user_id',
  as: 'uploadedFiles',
});

// Notification <-> User (One-to-Many)
Notification.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

User.hasMany(Notification, {
  foreignKey: 'user_id',
  as: 'notifications',
});

// Notification <-> Task (Optional)
Notification.belongsTo(Task, {
  foreignKey: 'related_task_id',
  as: 'relatedTask',
});

Task.hasMany(Notification, {
  foreignKey: 'related_task_id',
  as: 'notifications',
});

// Notification <-> Project (Optional)
Notification.belongsTo(Project, {
  foreignKey: 'related_project_id',
  as: 'relatedProject',
});

Project.hasMany(Notification, {
  foreignKey: 'related_project_id',
  as: 'notifications',
});

// Group <-> User (One-to-Many: Group owner)
Group.belongsTo(User, {
  foreignKey: 'owner_id',
  as: 'owner',
});

User.hasMany(Group, {
  foreignKey: 'owner_id',
  as: 'ownedGroups',
});

// Project <-> Group (One-to-Many)
Project.belongsTo(Group, {
  foreignKey: 'group_id',
  as: 'group',
});

Group.hasMany(Project, {
  foreignKey: 'group_id',
  as: 'projects',
});

// Milestone <-> Project (One-to-Many)
Milestone.belongsTo(Project, {
  foreignKey: 'project_id',
  as: 'project',
});

Project.hasMany(Milestone, {
  foreignKey: 'project_id',
  as: 'milestones',
});

// Milestone <-> User (Many-to-One: created_by)
Milestone.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator',
});

User.hasMany(Milestone, {
  foreignKey: 'created_by',
  as: 'createdMilestones',
});

// Task <-> Group (Many-to-One)
Task.belongsTo(Group, {
  foreignKey: 'group_id',
  as: 'group',
});

Group.hasMany(Task, {
  foreignKey: 'group_id',
  as: 'tasks',
});

// Task <-> Milestone (Many-to-One)
Task.belongsTo(Milestone, {
  foreignKey: 'milestone_id',
  as: 'milestone',
});

Milestone.hasMany(Task, {
  foreignKey: 'milestone_id',
  as: 'tasks',
});

// Task <-> User (Many-to-Many for multiple assignees)
Task.belongsToMany(User, {
  through: 'task_assignees',
  foreignKey: 'task_id',
  otherKey: 'user_id',
  as: 'assignees',
});

User.belongsToMany(Task, {
  through: 'task_assignees',
  foreignKey: 'user_id',
  otherKey: 'task_id',
  as: 'assignedTasksMultiple',
});

export {
  User,
  Team,
  Group,
  Project,
  Milestone,
  Task,
  Comment,
  Attachment,
  Notification,
};

export default {
  User,
  Team,
  Group,
  Project,
  Milestone,
  Task,
  Comment,
  Attachment,
  Notification,
};
