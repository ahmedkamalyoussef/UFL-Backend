import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface PlayerMatchStatisticAttributes {
  id: string;
  fixtureId: string;
  playerId: string;
  goals: number;
  assists: number;
  bigChancesCreated: number;
  successfulPasses: number;
  failedPasses: number;
  tackles: number;
  yellowCards: number;
  redCards: number;
  cleanSheet: boolean;
  saves: number;
  minutesPlayed: number;
  totalFantasyPoints: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type PlayerMatchStatisticCreationAttributes = Optional<
  PlayerMatchStatisticAttributes,
  | 'id'
  | 'goals'
  | 'assists'
  | 'bigChancesCreated'
  | 'successfulPasses'
  | 'failedPasses'
  | 'tackles'
  | 'yellowCards'
  | 'redCards'
  | 'cleanSheet'
  | 'saves'
  | 'minutesPlayed'
  | 'totalFantasyPoints'
  | 'createdAt'
  | 'updatedAt'
>;

export class PlayerMatchStatistic extends Model<PlayerMatchStatisticAttributes, PlayerMatchStatisticCreationAttributes> implements PlayerMatchStatisticAttributes {
  public id!: string;
  public fixtureId!: string;
  public playerId!: string;
  public goals!: number;
  public assists!: number;
  public bigChancesCreated!: number;
  public successfulPasses!: number;
  public failedPasses!: number;
  public tackles!: number;
  public yellowCards!: number;
  public redCards!: number;
  public cleanSheet!: boolean;
  public saves!: number;
  public minutesPlayed!: number;
  public totalFantasyPoints!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PlayerMatchStatistic.init(
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
      allowNull: false,
      references: {
        model: 'players',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    goals: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    assists: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    bigChancesCreated: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    successfulPasses: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    failedPasses: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    tackles: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    yellowCards: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    redCards: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    cleanSheet: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    saves: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    minutesPlayed: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    totalFantasyPoints: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
    },
  },
  {
    sequelize,
    tableName: 'player_match_statistics',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['fixtureId', 'playerId'] },
      { fields: ['fixtureId'] },
      { fields: ['playerId'] },
    ],
  }
);
