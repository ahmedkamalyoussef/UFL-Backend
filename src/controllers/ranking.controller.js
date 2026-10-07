"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RankingController = void 0;
const ranking_service_1 = require("../services/ranking.service");
const season_service_1 = require("../services/season.service");
const response_1 = require("../utils/response");
class RankingController {
    static async getGlobalLeaderboard(req, res, next) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
            const result = await ranking_service_1.RankingService.getLeaderboard(undefined, limit);
            (0, response_1.sendSuccess)(res, result, 200);
        }
        catch (error) {
            next(error);
        }
    }
    static async getCurrentUserRank(req, res, next) {
        try {
            const userId = req.user.userId;
            const result = await ranking_service_1.RankingService.getUserRank(userId);
            (0, response_1.sendSuccess)(res, result, 200);
        }
        catch (error) {
            next(error);
        }
    }
    static async getSeasons(req, res, next) {
        try {
            const seasons = await season_service_1.SeasonService.getAllSeasons();
            (0, response_1.sendSuccess)(res, seasons, 200);
        }
        catch (error) {
            next(error);
        }
    }
    static async getSeasonLeaderboard(req, res, next) {
        try {
            const { seasonId } = req.params;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
            const result = await ranking_service_1.RankingService.getLeaderboard(seasonId, limit);
            (0, response_1.sendSuccess)(res, result, 200);
        }
        catch (error) {
            next(error);
        }
    }
    static async createSeason(req, res, next) {
        try {
            const { name, startDate, endDate } = req.body;
            const season = await season_service_1.SeasonService.createSeason(name, new Date(startDate), new Date(endDate));
            (0, response_1.sendSuccess)(res, season, 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async activateSeason(req, res, next) {
        try {
            const { seasonId } = req.params;
            const season = await season_service_1.SeasonService.activateSeason(seasonId);
            (0, response_1.sendSuccess)(res, season, 200);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.RankingController = RankingController;
