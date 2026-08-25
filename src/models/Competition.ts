import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type CompetitionCode = 'EPL' | 'LALIGA' | 'SPL' | 'UCL' | 'ACL';

export interface CompetitionAttributes {
  id: string;
  externalId: number;
  name: string;
  code: CompetitionCode;
  logoUrl?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CompetitionCreationAttributes = Optional<CompetitionAttributes, 'id' | 'logoUrl' | 'createdAt' | 'updatedAt'>;

export class Competition extends Model<CompetitionAttributes, CompetitionCreationAttributes> implements CompetitionAttributes {
  public id!: string;
  public externalId!: number;
  public name!: string;
  public code!: CompetitionCode;
  public logoUrl!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Competition.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    externalId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    code: {
      type: DataTypes.ENUM('EPL', 'LALIGA', 'SPL', 'UCL', 'ACL'),
      allowNull: false,
      unique: true,
    },
    logoUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'competitions',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['externalId'] },
      { unique: true, fields: ['code'] },
    ],
  }
);
