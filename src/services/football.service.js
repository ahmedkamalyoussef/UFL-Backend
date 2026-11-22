"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FootballService = void 0;
const models_1 = require("../models");
const competitions_1 = require("../domain/competitions");
const sequelize_1 = require("sequelize");
class FootballService {
    static async getCompetitions() {
        // Return all 5 supported competitions from database or whitelist
        const dbCompetitions = await models_1.Competition.findAll({
            where: {
                code: {
                    [sequelize_1.Op.in]: Object.keys(competitions_1.SUPPORTED_COMPETITIONS),
                },
            },
        });
        if (dbCompetitions.length > 0) {
            return dbCompetitions.filter((c) => (0, competitions_1.isSupportedCompetition)(c.code));
        }
        // Fallback to static supported whitelist if DB not seeded
        return Object.values(competitions_1.SUPPORTED_COMPETITIONS);
    }
    static async getMatches(status, competitionId) {
        const whereClause = {};
        if (status) {
            whereClause.status = status.toUpperCase();
        }
        if (competitionId) {
            whereClause.competitionId = competitionId;
        }

        // Only return today's and future matches for upcoming (or live/recent),
        // filtering out stale historical fixtures older than today.
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        if (!status) {
            // If no status specified, show LIVE first, then SCHEDULED from today onwards
            whereClause[sequelize_1.Op.or] = [
                { status: { [sequelize_1.Op.in]: ['LIVE', 'HALFTIME'] } },
                {
                    status: 'SCHEDULED',
                    startTime: { [sequelize_1.Op.gte]: startOfToday },
                },
            ];
        }

        const fixtures = await models_1.Fixture.findAll({
            where: whereClause,
            include: [
                { model: models_1.Competition, as: 'competition' },
                { model: models_1.Team, as: 'homeTeam' },
                { model: models_1.Team, as: 'awayTeam' },
            ],
            order: [
                // Live matches first, then chronological by startTime
                [sequelize_1.Sequelize.literal(`CASE WHEN \`Fixture\`.\`status\` IN ('LIVE', 'HALFTIME') THEN 0 ELSE 1 END`), 'ASC'],
                ['startTime', 'ASC'],
            ],
        });
        // Filter strictly by supported competition whitelist
        return fixtures.filter((f) => f.get('competition') && (0, competitions_1.isSupportedCompetition)(f.get('competition').code));
    }
    static async getMatchById(fixtureId) {
        const fixture = await models_1.Fixture.findByPk(fixtureId, {
            include: [
                { model: models_1.Competition, as: 'competition' },
                { model: models_1.Team, as: 'homeTeam' },
                { model: models_1.Team, as: 'awayTeam' },
            ],
        });
        if (!fixture) {
            throw { code: 'MATCH_NOT_FOUND', message: 'Match fixture not found', statusCode: 404 };
        }
        const comp = fixture.get('competition');
        if (!comp || !(0, competitions_1.isSupportedCompetition)(comp.code)) {
            throw { code: 'UNSUPPORTED_COMPETITION', message: 'Match belongs to an unsupported competition', statusCode: 400 };
        }
        return fixture;
    }
}
exports.FootballService = FootballService;
