import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type WalletTransactionType = 'WELCOME_BONUS' | 'GAME_ENTRY' | 'GAME_REWARD' | 'REWARDED_AD' | 'GAME_REFUND';

export interface WalletTransactionAttributes {
  id: string;
  walletId: string;
  amount: number;
  type: WalletTransactionType;
  referenceId?: string | null;
  description: string;
  createdAt?: Date;
}

export type WalletTransactionCreationAttributes = Optional<WalletTransactionAttributes, 'id' | 'referenceId' | 'createdAt'>;

export class WalletTransaction extends Model<WalletTransactionAttributes, WalletTransactionCreationAttributes> implements WalletTransactionAttributes {
  public id!: string;
  public walletId!: string;
  public amount!: number;
  public type!: WalletTransactionType;
  public referenceId!: string | null;
  public description!: string;
  public readonly createdAt!: Date;
}

WalletTransaction.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    walletId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'wallets',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('WELCOME_BONUS', 'GAME_ENTRY', 'GAME_REWARD', 'REWARDED_AD', 'GAME_REFUND'),
      allowNull: false,
    },
    referenceId: {
      type: DataTypes.CHAR(36),
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'wallet_transactions',
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ['walletId'] },
      { fields: ['walletId', 'referenceId', 'type'] },
    ],
  }
);
