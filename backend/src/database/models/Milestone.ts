import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../config/database';

export interface MilestoneAttributes {
  id: number;
  projectId: number;
  name: string;
  description?: string;
  type: 'milestone' | 'sprint';
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  startDate?: Date;
  endDate?: Date;
  iconUrl?: string;
  createdBy: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface MilestoneCreationAttributes
  extends Optional<
    MilestoneAttributes,
    'id' | 'description' | 'type' | 'status' | 'startDate' | 'endDate' | 'iconUrl' | 'createdAt' | 'updatedAt' | 'deletedAt'
  > {}

class Milestone extends Model<MilestoneAttributes, MilestoneCreationAttributes> implements MilestoneAttributes {
  public id!: number;
  public projectId!: number;
  public name!: string;
  public description?: string;
  public type!: 'milestone' | 'sprint';
  public status!: 'planning' | 'active' | 'completed' | 'cancelled';
  public startDate?: Date;
  public endDate?: Date;
  public iconUrl?: string;
  public createdBy!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;
}

Milestone.init(
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
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('milestone', 'sprint'),
      allowNull: false,
      defaultValue: 'milestone',
    },
    status: {
      type: DataTypes.ENUM('planning', 'active', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'planning',
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'start_date',
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'end_date',
    },
    iconUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'icon_url',
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
  },
  {
    sequelize,
    tableName: 'milestones',
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

export default Milestone;
