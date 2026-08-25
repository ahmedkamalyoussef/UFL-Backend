import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface PlayerSelectionAttributes {
  id: string;
  gameId: string;
  participantId: string;
  playerId: string;
  turnNumber: number;
  isAutoPick: boolean;
  selectedAt?: Date;
}

export type PlayerSelectionCreationAttributes = Optional<PlayerSelectionAttributes, 'id' | 'isAutoPick' | 'selectedAt'>;

export class PlayerSelection extends Model<PlayerSelectionAttributes, PlayerSelectionCreationAttributes> implements PlayerSelectionAttributes {
  public id!: string;
  public gameId!: string;
  public participantId!: string;
  public playerId!: string;
  public turnNumber!: number;
  public isAutoPick!: boolean;
  public readonly selectedAt!: Date;
}

PlayerSelection.init(
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
    participantId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'game_participants',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    playerId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'players',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    turnNumber: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
    },
    isAutoPick: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'player_selections',
    timestamps: true,
    createdAt: 'selectedAt',
    updatedAt: false,
    indexes: [
      { unique: true, fields: ['gameId', 'playerId'] },
      { fields: ['gameId'] },
      { fields: ['participantId'] },
      { fields: ['playerId'] },
    ],
  }
);
