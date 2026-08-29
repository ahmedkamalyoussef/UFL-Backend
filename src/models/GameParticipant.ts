import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface GameParticipantAttributes {
  id: string;
  gameId: string;
  userId: string;
  draftPosition: number;
  totalPoints: number;
  finalRank?: number | null;
  coinReward?: number | null;
  rpChange?: number | null;
  joinedAt?: Date;
}

export type GameParticipantCreationAttributes = Optional<
  GameParticipantAttributes,
  'id' | 'totalPoints' | 'finalRank' | 'coinReward' | 'rpChange' | 'joinedAt'
>;

export class GameParticipant extends Model<GameParticipantAttributes, GameParticipantCreationAttributes> implements GameParticipantAttributes {
  declare id!: string;
  declare gameId!: string;
  declare userId!: string;
  declare draftPosition!: number;
  declare totalPoints!: number;
  declare finalRank!: number | null;
  declare coinReward!: number | null;
  declare rpChange!: number | null;
  declare joinedAt!: Date;
}

GameParticipant.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    gameId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'games',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    userId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    draftPosition: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      validate: {
        min: 1,
        max: 4,
      },
    },
    totalPoints: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
    },
    finalRank: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
      validate: {
        min: 1,
        max: 4,
      },
    },
    coinReward: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    rpChange: {
      type: DataTypes.TINYINT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'game_participants',
    timestamps: true,
    createdAt: 'joinedAt',
    updatedAt: false,
    indexes: [
      { unique: true, fields: ['gameId', 'userId'] },
      { fields: ['gameId'] },
      { fields: ['userId'] },
    ],
  }
);
