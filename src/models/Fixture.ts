import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type FixtureStatus = 'SCHEDULED' | 'LIVE' | 'HALFTIME' | 'FINISHED' | 'CANCELLED' | 'SUSPENDED' | 'POSTPONED';

export interface FixtureAttributes {
  id: string;
  externalId: number;
  competitionId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  elapsed: number;
  status: FixtureStatus;
  startTime: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type FixtureCreationAttributes = Optional<FixtureAttributes, 'id' | 'homeScore' | 'awayScore' | 'elapsed' | 'status' | 'createdAt' | 'updatedAt'>;

export class Fixture extends Model<FixtureAttributes, FixtureCreationAttributes> implements FixtureAttributes {
  declare id!: string;
  declare externalId!: number;
  declare competitionId!: string;
  declare homeTeamId!: string;
  declare awayTeamId!: string;
  declare homeScore!: number;
  declare awayScore!: number;
  declare elapsed!: number;
  declare status!: FixtureStatus;
  declare startTime!: Date;
  declare createdAt!: Date;
  declare updatedAt!: Date;
}

Fixture.init(
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
    homeTeamId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'teams',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    awayTeamId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'teams',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    homeScore: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    awayScore: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    elapsed: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('SCHEDULED', 'LIVE', 'HALFTIME', 'FINISHED', 'CANCELLED', 'SUSPENDED', 'POSTPONED'),
      allowNull: false,
      defaultValue: 'SCHEDULED',
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'fixtures',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['externalId'] },
      { fields: ['competitionId'] },
      { fields: ['status'] },
      { fields: ['startTime'] },
    ],
  }
);
