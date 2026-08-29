import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type FixtureEventType = 'GOAL' | 'ASSIST' | 'PASS' | 'TACKLE' | 'YELLOW_CARD' | 'RED_CARD' | 'SAVE' | 'CLEAN_SHEET';

export interface FixtureEventAttributes {
  id: string;
  fixtureId: string;
  playerId?: string | null;
  eventType: FixtureEventType;
  minute: number;
  detail?: string | null;
  createdAt?: Date;
}

export type FixtureEventCreationAttributes = Optional<FixtureEventAttributes, 'id' | 'playerId' | 'detail' | 'createdAt'>;

export class FixtureEvent extends Model<FixtureEventAttributes, FixtureEventCreationAttributes> implements FixtureEventAttributes {
  declare id!: string;
  declare fixtureId!: string;
  declare playerId!: string | null;
  declare eventType!: FixtureEventType;
  declare minute!: number;
  declare detail!: string | null;
  declare createdAt!: Date;
}

FixtureEvent.init(
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
    playerId: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'players',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    eventType: {
      type: DataTypes.ENUM('GOAL', 'ASSIST', 'PASS', 'TACKLE', 'YELLOW_CARD', 'RED_CARD', 'SAVE', 'CLEAN_SHEET'),
      allowNull: false,
    },
    minute: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    detail: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'fixture_events',
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ['fixtureId'] },
      { fields: ['playerId'] },
    ],
  }
);
