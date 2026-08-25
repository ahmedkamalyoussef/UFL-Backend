import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type NotificationType = 'WELCOME_BONUS' | 'MATCH_STARTING' | 'GAME_RESULT' | 'WALLET_UPDATE';

export interface NotificationAttributes {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type NotificationCreationAttributes = Optional<NotificationAttributes, 'id' | 'isRead' | 'createdAt' | 'updatedAt'>;

export class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> implements NotificationAttributes {
  public id!: string;
  public userId!: string;
  public title!: string;
  public message!: string;
  public type!: NotificationType;
  public isRead!: boolean;
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
      type: DataTypes.ENUM('WELCOME_BONUS', 'MATCH_STARTING', 'GAME_RESULT', 'WALLET_UPDATE'),
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'notifications',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['isRead'] },
    ],
  }
);
