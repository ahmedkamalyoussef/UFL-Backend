"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeasonService = void 0;
const database_1 = require("../config/database");
const models_1 = require("../models");
class SeasonService {
    /**
     * Retrieves the currently ACTIVE season, creating default Season 2026 if none exists
     */
    static async getActiveSeason(transaction) {
        let activeSeason = await models_1.Season.findOne({
            where: { status: 'ACTIVE' },
            transaction,
        });
        if (!activeSeason) {
            activeSeason = await models_1.Season.create({
                name: 'Season 2026',
                startDate: new Date('2026-01-01'),
                endDate: new Date('2026-12-31'),
                status: 'ACTIVE',
            }, { transaction });
        }
        return activeSeason;
    }
    /**
     * Retrieves all seasons ordered by startDate DESC
     */
    static async getAllSeasons() {
        return await models_1.Season.findAll({
            order: [['startDate', 'DESC']],
        });
    }
    /**
     * Creates a new season in UPCOMING status
     */
    static async createSeason(name, startDate, endDate) {
        return await models_1.Season.create({
            name,
            startDate,
            endDate,
            status: 'UPCOMING',
        });
    }
    /**
     * Transition season to ACTIVE, completing any previous active season atomically
     */
    static async activateSeason(seasonId) {
        return await database_1.sequelize.transaction(async (t) => {
            const targetSeason = await models_1.Season.findByPk(seasonId, {
                transaction: t,
                lock: t.LOCK.UPDATE,
            });
            if (!targetSeason) {
                throw { code: 'SEASON_NOT_FOUND', message: 'Season not found', statusCode: 404 };
            }
            // Complete previous active season
            await models_1.Season.update({ status: 'COMPLETED' }, {
                where: { status: 'ACTIVE' },
                transaction: t,
            });
            // Activate target season
            targetSeason.status = 'ACTIVE';
            await targetSeason.save({ transaction: t });
            return targetSeason;
        });
    }
}
exports.SeasonService = SeasonService;
