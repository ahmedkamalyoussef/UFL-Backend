import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type DraftTurnStatus = 'PENDING' | 'COMPLETED' | 'TIMED_OUT';

export interface DraftTurnAttributes {
  id: string;
  gameId: string;
  turnNumber: number;
  round: number;
  participantId: string;
  expiresAt: Date;
  status: DraftTurnStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export type DraftTurnCreationAttributes = Optional<DraftTurnAttributes, 'id' | 'status' | 'createdAt' | 'updatedAt'>;

export class DraftTurn extends Model<DraftTurnAttributes, DraftTurnCreationAttributes> implements DraftTurnAttributes {
  declare id!: string;
  declare gameId!: string;
  declare turnNumber!: number;
  declare round!: number;
  declare participantId!: string;
  declare expiresAt!: Date;
  declare status!: DraftTurnStatus;
  declare createdAt!: Date;
  declare updatedAt!: Date;
}

DraftTurn.init(
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
    turnNumber: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      validate: {
        min: 1,
        max: 8,
      },
    },
    round: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      validate: {
        min: 1,
        max: 2,
      },
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
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'COMPLETED', 'TIMED_OUT'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
  },
  {
    sequelize,
    tableName: 'draft_turns',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['gameId', 'turnNumber'] },
      { fields: ['gameId'] },
      { fields: ['participantId'] },
    ],
  }
);
