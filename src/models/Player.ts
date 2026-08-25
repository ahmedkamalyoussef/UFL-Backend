import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type FootballPosition = 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'ATTACKER';

export interface PlayerAttributes {
  id: string;
  externalId: number;
  teamId: string;
  name: string;
  position: FootballPosition;
  photoUrl: string;
  isStar: boolean;
  avgPoints: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type PlayerCreationAttributes = Optional<PlayerAttributes, 'id' | 'isStar' | 'avgPoints' | 'createdAt' | 'updatedAt'>;

export class Player extends Model<PlayerAttributes, PlayerCreationAttributes> implements PlayerAttributes {
  public id!: string;
  public externalId!: number;
  public teamId!: string;
  public name!: string;
  public position!: FootballPosition;
  public photoUrl!: string;
  public isStar!: boolean;
  public avgPoints!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Player.init(
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
    teamId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'teams',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    position: {
      type: DataTypes.ENUM('GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'ATTACKER'),
      allowNull: false,
    },
    photoUrl: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    isStar: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    avgPoints: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
    },
  },
  {
    sequelize,
    tableName: 'players',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['externalId'] },
      { fields: ['teamId'] },
      { fields: ['avgPoints'] },
    ],
  }
);
