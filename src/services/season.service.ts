import { sequelize } from '../config/database';
import { Season } from '../models';

export class SeasonService {
  /**
   * Retrieves the currently ACTIVE season, creating default Season 2026 if none exists
   */
  public static async getActiveSeason(transaction?: any): Promise<Season> {
    let activeSeason = await Season.findOne({
      where: { status: 'ACTIVE' },
      transaction,
    });

    if (!activeSeason) {
      activeSeason = await Season.create(
        {
          name: 'Season 2026',
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-12-31'),
          status: 'ACTIVE',
        },
        { transaction }
      );
    }

    return activeSeason;
  }

  /**
   * Retrieves all seasons ordered by startDate DESC
   */
  public static async getAllSeasons() {
    return await Season.findAll({
      order: [['startDate', 'DESC']],
    });
  }

  /**
   * Creates a new season in UPCOMING status
   */
  public static async createSeason(name: string, startDate: Date, endDate: Date): Promise<Season> {
    return await Season.create({
      name,
      startDate,
      endDate,
      status: 'UPCOMING',
    });
  }

  /**
   * Transition season to ACTIVE, completing any previous active season atomically
   */
  public static async activateSeason(seasonId: string): Promise<Season> {
    return await sequelize.transaction(async (t) => {
      const targetSeason = await Season.findByPk(seasonId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!targetSeason) {
        throw { code: 'SEASON_NOT_FOUND', message: 'Season not found', statusCode: 404 };
      }

      // Complete previous active season
      await Season.update(
        { status: 'COMPLETED' },
        {
          where: { status: 'ACTIVE' },
          transaction: t,
        }
      );

      // Activate target season
      targetSeason.status = 'ACTIVE';
      await targetSeason.save({ transaction: t });

      return targetSeason;
    });
  }
}
