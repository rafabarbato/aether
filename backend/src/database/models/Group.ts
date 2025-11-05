import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../config/database';

export interface GroupAttributes {
  id: number;
  name: string;
  description?: string;
  color?: string;
  iconUrl?: string;
  ownerId: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface GroupCreationAttributes
  extends Optional<
    GroupAttributes,
    'id' | 'description' | 'color' | 'iconUrl' | 'isActive' | 'createdAt' | 'updatedAt' | 'deletedAt'
  > {}

class Group extends Model<GroupAttributes, GroupCreationAttributes> implements GroupAttributes {
  public id!: number;
  public name!: string;
  public description?: string;
  public color?: string;
  public iconUrl?: string;
  public ownerId!: number;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;
}

Group.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
      defaultValue: '#3B82F6', // Default blue color
    },
    iconUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'icon_url',
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
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
  },
  {
    sequelize,
    tableName: 'groups',
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

export default Group;
