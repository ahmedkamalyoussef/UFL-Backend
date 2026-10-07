"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameController = void 0;
const game_service_1 = require("../services/game.service");
const response_1 = require("../utils/response");
class GameController {
    static async createGame(req, res, next) {
        try {
            const { fixtureId, entryFee } = req.body;
            if (!fixtureId) {
                throw { code: 'VALIDATION_ERROR', message: 'fixtureId is required', statusCode: 400 };
            }
            const game = await game_service_1.GameService.createGame(fixtureId, entryFee ? parseInt(entryFee, 10) : 500);
            (0, response_1.sendSuccess)(res, game, 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async getGames(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { status } = req.query;
            const games = await game_service_1.GameService.getGames(userId, status);
            (0, response_1.sendSuccess)(res, games, 200);
        }
        catch (error) {
            next(error);
        }
    }
    static async getGameById(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { id } = req.params;
            const game = await game_service_1.GameService.getGameById(id, userId);
            (0, response_1.sendSuccess)(res, game, 200);
        }
        catch (error) {
            next(error);
        }
    }
    static async joinGame(req, res, next) {
        try {
            const userId = req.user.userId;
            const { id } = req.params;
            const result = await game_service_1.GameService.joinGame(id, userId);
            (0, response_1.sendSuccess)(res, result, 200);
        }
        catch (error) {
            next(error);
        }
    }
    static async cancelGame(req, res, next) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const result = await game_service_1.GameService.cancelGame(id, reason);
            (0, response_1.sendSuccess)(res, result, 200);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.GameController = GameController;
