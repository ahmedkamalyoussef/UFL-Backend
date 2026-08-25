import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type NotificationType =
  | 'WELCOME_BONUS'
  | 'MATCH_STARTING'
  | 'GAME_RESULT'
  | 'WALLET_UPDATE'
  | 'GAME_JOINED'
  | 'GAME_STARTED'
  | 'GAME_FINISHED'
  | 'GAME_CANCELLED'
  | 'GAME_REFUNDED'
  | 'RANKING_UPDATED'
  | 'SEASON_STARTED'
  | 'SYSTEM';

export interface NotificationAttributes {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  readAt?: Date | null;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type NotificationCreationAttributes = Optional<
  NotificationAttributes,
  'id' | 'isRead' | 'readAt' | 'relatedEntityType' | 'relatedEntityId' | 'createdAt' | 'updatedAt'
>;

export class Notification
  extends Model<NotificationAttributes, NotificationCreationAttributes>
  implements NotificationAttributes
{
  public id!: string;
  public userId!: string;
  public title!: string;
  public message!: string;
  public type!: NotificationType;
  public isRead!: boolean;
  public readAt!: Date | null;
  public relatedEntityType!: string | null;
  public relatedEntityId!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Notification.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(
        'WELCOME_BONUS',
        'MATCH_STARTING',
        'GAME_RESULT',
        'WALLET_UPDATE',
        'GAME_JOINED',
        'GAME_STARTED',
        'GAME_FINISHED',
        'GAME_CANCELLED',
        'GAME_REFUNDED',
        'RANKING_UPDATED',
        'SEASON_STARTED',
        'SYSTEM'
      ),
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    relatedEntityType: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    relatedEntityId: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'notifications',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['isRead'] },
      { fields: ['userId', 'type', 'relatedEntityId'] },
    ],
  }
);
