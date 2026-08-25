import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type GameStatus = 'WAITING' | 'DRAFTING' | 'LIVE' | 'FINISHED' | 'CANCELLED';

export interface GameAttributes {
  id: string;
  fixtureId: string;
  status: GameStatus;
  entryFee: number;
  currentDraftTurn: number;
  createdAt?: Date;
  finishedAt?: Date | null;
}

export type GameCreationAttributes = Optional<GameAttributes, 'id' | 'status' | 'entryFee' | 'currentDraftTurn' | 'createdAt' | 'finishedAt'>;

export class Game extends Model<GameAttributes, GameCreationAttributes> implements GameAttributes {
  public id!: string;
  public fixtureId!: string;
  public status!: GameStatus;
  public entryFee!: number;
  public currentDraftTurn!: number;
  public readonly createdAt!: Date;
  public finishedAt!: Date | null;
}

Game.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    fixtureId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'fixtures',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    status: {
      type: DataTypes.ENUM('WAITING', 'DRAFTING', 'LIVE', 'FINISHED', 'CANCELLED'),
      allowNull: false,
      defaultValue: 'WAITING',
    },
    entryFee: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 500,
    },
    currentDraftTurn: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
    },
    finishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'games',
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ['fixtureId'] },
      { fields: ['status'] },
    ],
  }
);
