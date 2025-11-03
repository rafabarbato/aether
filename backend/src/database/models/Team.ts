import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../config/database';

export interface TeamAttributes {
  id: number;
  name: string;
  description?: string;
  color?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface TeamCreationAttributes
  extends Optional<TeamAttributes, 'id' | 'description' | 'color' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

class Team extends Model<TeamAttributes, TeamCreationAttributes> implements TeamAttributes {
  public id!: number;
  public name!: string;
  public description?: string;
  public color?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;
}

Team.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'teams',
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

export default Team;
