import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type SeasonStatus = 'UPCOMING' | 'ACTIVE' | 'COMPLETED';

export interface SeasonAttributes {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: SeasonStatus;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type SeasonCreationAttributes = Optional<SeasonAttributes, 'id' | 'status' | 'isActive' | 'createdAt' | 'updatedAt'>;

export class Season extends Model<SeasonAttributes, SeasonCreationAttributes> implements SeasonAttributes {
  declare id!: string;
  declare name!: string;
  declare startDate!: Date;
  declare endDate!: Date;
  declare status!: SeasonStatus;
  declare isActive!: boolean;
  declare createdAt!: Date;
  declare updatedAt!: Date;
}

Season.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('UPCOMING', 'ACTIVE', 'COMPLETED'),
      allowNull: false,
      defaultValue: 'ACTIVE',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'seasons',
    timestamps: true,
    indexes: [
      { fields: ['status'] },
      { fields: ['isActive'] },
    ],
  }
);
