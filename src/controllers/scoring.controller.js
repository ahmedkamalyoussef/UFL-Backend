"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoringController = void 0;
const scoring_service_1 = require("../services/scoring.service");
const response_1 = require("../utils/response");
class ScoringController {
    static async getGameRankings(req, res, next) {
        try {
            const { id } = req.params;
            const rankings = await scoring_service_1.ScoringService.getGameRankings(id);
            (0, response_1.sendSuccess)(res, rankings, 200);
        }
        catch (error) {
            next(error);
        }
    }
    static async getPlayerPointsBreakdown(req, res, next) {
        try {
            const { id, playerId } = req.params;
            const breakdown = await scoring_service_1.ScoringService.getPlayerPointsBreakdown(id, playerId);
            (0, response_1.sendSuccess)(res, breakdown, 200);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ScoringController = ScoringController;
