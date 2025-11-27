import { DataTypes, Model, Optional, Association } from 'sequelize';
import sequelize from '../../config/database';
import User from './User';

export interface AttachmentAttributes {
  id: number;
  taskId: number;
  userId: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
  filePath: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface AttachmentCreationAttributes
  extends Optional<AttachmentAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

class Attachment extends Model<AttachmentAttributes, AttachmentCreationAttributes> implements AttachmentAttributes {
  public id!: number;
  public taskId!: number;
  public userId!: number;
  public fileName!: string;
  public fileSize!: number;
  public mimeType!: string;
  public filePath!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;

  // Associations
  public readonly user?: User;

  public static associations: {
    user: Association<Attachment, User>;
  };
}

Attachment.init(
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
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'file_name',
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'file_size',
    },
    mimeType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'mime_type',
    },
    filePath: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'file_path',
    },
  },
  {
    sequelize,
    tableName: 'attachments',
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

export default Attachment;
