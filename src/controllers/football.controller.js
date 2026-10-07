"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FootballController = void 0;
const football_service_1 = require("../services/football.service");
const response_1 = require("../utils/response");
class FootballController {
    static async getCompetitions(_req, res, next) {
        try {
            const competitions = await football_service_1.FootballService.getCompetitions();
            (0, response_1.sendSuccess)(res, competitions, 200);
        }
        catch (error) {
            next(error);
        }
    }
    static async getMatches(req, res, next) {
        try {
            const { status, competitionId } = req.query;
            const matches = await football_service_1.FootballService.getMatches(status, competitionId);
            (0, response_1.sendSuccess)(res, matches, 200);
        }
        catch (error) {
            next(error);
        }
    }
    static async getMatchById(req, res, next) {
        try {
            const { id } = req.params;
            const match = await football_service_1.FootballService.getMatchById(id);
            (0, response_1.sendSuccess)(res, match, 200);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.FootballController = FootballController;
