import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface GlobalRankingAttributes {
  id: string;
  seasonId: string;
  userId: string;
  rankingPoints: number;
  gamesPlayed: number;
  gamesWon: number;
  rankPosition?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type GlobalRankingCreationAttributes = Optional<
  GlobalRankingAttributes,
  'id' | 'rankingPoints' | 'gamesPlayed' | 'gamesWon' | 'rankPosition' | 'createdAt' | 'updatedAt'
>;

export class GlobalRanking extends Model<GlobalRankingAttributes, GlobalRankingCreationAttributes> implements GlobalRankingAttributes {
  declare id!: string;
  declare seasonId!: string;
  declare userId!: string;
  declare rankingPoints!: number;
  declare gamesPlayed!: number;
  declare gamesWon!: number;
  declare rankPosition!: number | null;
  declare createdAt!: Date;
  declare updatedAt!: Date;
}

GlobalRanking.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    seasonId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'seasons',
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
    rankingPoints: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    gamesPlayed: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    gamesWon: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    rankPosition: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'global_rankings',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['seasonId', 'userId'] },
      { fields: ['seasonId'] },
      { fields: ['userId'] },
      { fields: ['rankingPoints'] },
    ],
  }
);
