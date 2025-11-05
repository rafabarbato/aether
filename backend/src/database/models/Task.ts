import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../config/database';

export interface TaskAttributes {
  id: number;
  projectId: number;
  groupId?: number;
  milestoneId?: number;
  title: string;
  description?: string;
  status: 'ready' | 'in_progress' | 'in_review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tagLabel?: string;
  assignedTo?: number; // Keep for backward compatibility, deprecated in favor of many-to-many
  createdBy: number;
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: Date;
  completedAt?: Date;
  position: number; // For kanban column ordering
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface TaskCreationAttributes
  extends Optional<
    TaskAttributes,
    | 'id'
    | 'description'
    | 'status'
    | 'priority'
    | 'tagLabel'
    | 'assignedTo'
    | 'groupId'
    | 'milestoneId'
    | 'estimatedHours'
    | 'actualHours'
    | 'dueDate'
    | 'completedAt'
    | 'position'
    | 'createdAt'
    | 'updatedAt'
    | 'deletedAt'
  > {}

class Task extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
  public id!: number;
  public projectId!: number;
  public groupId?: number;
  public milestoneId?: number;
  public title!: string;
  public description?: string;
  public status!: 'ready' | 'in_progress' | 'in_review' | 'done';
  public priority!: 'low' | 'medium' | 'high' | 'urgent';
  public tagLabel?: string;
  public assignedTo?: number;
  public createdBy!: number;
  public estimatedHours?: number;
  public actualHours?: number;
  public dueDate?: Date;
  public completedAt?: Date;
  public position!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;
}

Task.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'project_id',
      references: {
        model: 'projects',
        key: 'id',
      },
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'group_id',
      references: {
        model: 'groups',
        key: 'id',
      },
    },
    milestoneId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'milestone_id',
      references: {
        model: 'milestones',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('ready', 'in_progress', 'in_review', 'done'),
      allowNull: false,
      defaultValue: 'ready',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'medium',
    },
    tagLabel: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'tag_label',
    },
    assignedTo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'assigned_to',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'created_by',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    estimatedHours: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'estimated_hours',
    },
    actualHours: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'actual_hours',
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'due_date',
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'completed_at',
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'tasks',
    timestamps: true,
    paranoid: true,
    underscored: true,
    hooks: {
      beforeUpdate: (task: Task) => {
        if (task.changed('status') && task.status === 'done' && !task.completedAt) {
          task.completedAt = new Date();
        }
      },
    },
  }
);

export default Task;
