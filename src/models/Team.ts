import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface TeamAttributes {
  id: string;
  externalId: number;
  competitionId: string;
  name: string;
  code: string;
  logoUrl: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type TeamCreationAttributes = Optional<TeamAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export class Team extends Model<TeamAttributes, TeamCreationAttributes> implements TeamAttributes {
  public id!: string;
  public externalId!: number;
  public competitionId!: string;
  public name!: string;
  public code!: string;
  public logoUrl!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Team.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    externalId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      unique: true,
    },
    competitionId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'competitions',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    code: {
      type: DataTypes.CHAR(3),
      allowNull: false,
    },
    logoUrl: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'teams',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['externalId'] },
      { fields: ['competitionId'] },
    ],
  }
);
