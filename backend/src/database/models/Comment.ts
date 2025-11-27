import { DataTypes, Model, Optional, Association } from 'sequelize';
import sequelize from '../../config/database';
import User from './User';

export interface CommentAttributes {
  id: number;
  taskId: number;
  userId: number;
  content: string;
  parentId?: number; // For nested comments/replies
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface CommentCreationAttributes
  extends Optional<CommentAttributes, 'id' | 'parentId' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

class Comment extends Model<CommentAttributes, CommentCreationAttributes> implements CommentAttributes {
  public id!: number;
  public taskId!: number;
  public userId!: number;
  public content!: string;
  public parentId?: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;

  // Associations
  public readonly user?: User;
  public readonly replies?: Comment[];

  public static associations: {
    user: Association<Comment, User>;
    replies: Association<Comment, Comment>;
  };
}

Comment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    taskId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'task_id',
      references: {
        model: 'tasks',
        key: 'id',
      },
      onDelete: 'CASCADE',
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
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'parent_id',
      references: {
        model: 'comments',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'comments',
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

export default Comment;
