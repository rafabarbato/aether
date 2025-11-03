import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../config/database';

export interface NotificationAttributes {
  id: number;
  userId: number;
  type: 'task_assigned' | 'task_updated' | 'task_commented' | 'mention' | 'due_date_reminder';
  title: string;
  message: string;
  relatedTaskId?: number;
  relatedProjectId?: number;
  isRead: boolean;
  readAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface NotificationCreationAttributes
  extends Optional<
    NotificationAttributes,
    'id' | 'relatedTaskId' | 'relatedProjectId' | 'isRead' | 'readAt' | 'createdAt' | 'updatedAt' | 'deletedAt'
  > {}

class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> implements NotificationAttributes {
  public id!: number;
  public userId!: number;
  public type!: 'task_assigned' | 'task_updated' | 'task_commented' | 'mention' | 'due_date_reminder';
  public title!: string;
  public message!: string;
  public relatedTaskId?: number;
  public relatedProjectId?: number;
  public isRead!: boolean;
  public readAt?: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;
}

Notification.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM('task_assigned', 'task_updated', 'task_commented', 'mention', 'due_date_reminder'),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    relatedTaskId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'related_task_id',
      references: {
        model: 'tasks',
        key: 'id',
      },
    },
    relatedProjectId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'related_project_id',
      references: {
        model: 'projects',
        key: 'id',
      },
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_read',
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'read_at',
    },
  },
  {
    sequelize,
    tableName: 'notifications',
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

export default Notification;
