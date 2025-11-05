import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../config/database';

export interface ProjectAttributes {
  id: number;
  groupId?: number;
  name: string;
  description?: string;
  color?: string;
  ownerId: number;
  teamId?: number;
  startDate?: Date;
  endDate?: Date;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'archived';
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface ProjectCreationAttributes
  extends Optional<
    ProjectAttributes,
    'id' | 'groupId' | 'description' | 'color' | 'teamId' | 'startDate' | 'endDate' | 'status' | 'createdAt' | 'updatedAt' | 'deletedAt'
  > {}

class Project extends Model<ProjectAttributes, ProjectCreationAttributes> implements ProjectAttributes {
  public id!: number;
  public groupId?: number;
  public name!: string;
  public description?: string;
  public color?: string;
  public ownerId!: number;
  public teamId?: number;
  public startDate?: Date;
  public endDate?: Date;
  public status!: 'planning' | 'active' | 'on_hold' | 'completed' | 'archived';

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;
}

Project.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'owner_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'team_id',
      references: {
        model: 'teams',
        key: 'id',
      },
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
    status: {
      type: DataTypes.ENUM('planning', 'active', 'on_hold', 'completed', 'archived'),
      allowNull: false,
      defaultValue: 'planning',
    },
  },
  {
    sequelize,
    tableName: 'projects',
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

export default Project;
