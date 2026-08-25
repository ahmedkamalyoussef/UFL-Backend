import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface WalletAttributes {
  id: string;
  userId: string;
  balance: number;
  careerCoins: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type WalletCreationAttributes = Optional<WalletAttributes, 'id' | 'balance' | 'careerCoins' | 'createdAt' | 'updatedAt'>;

export class Wallet extends Model<WalletAttributes, WalletCreationAttributes> implements WalletAttributes {
  public id!: string;
  public userId!: string;
  public balance!: number;
  public careerCoins!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public get isEligibleForRewardedAd(): boolean {
    return this.balance === 0;
  }
}

Wallet.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    balance: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 500,
    },
    careerCoins: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 500,
    },
  },
  {
    sequelize,
    tableName: 'wallets',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['userId'] },
    ],
  }
);
