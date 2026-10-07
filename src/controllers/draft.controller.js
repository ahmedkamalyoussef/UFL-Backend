"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DraftController = void 0;
const draft_service_1 = require("../services/draft.service");
const response_1 = require("../utils/response");
class DraftController {
    static async startDraft(req, res, next) {
        try {
            const { id } = req.params;
            const result = await draft_service_1.DraftService.startDraft(id);
            (0, response_1.sendSuccess)(res, result, 200);
        }
        catch (error) {
            next(error);
        }
    }
    static async getDraftState(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user?.userId;
            const state = await draft_service_1.DraftService.getDraftState(id, userId);
            (0, response_1.sendSuccess)(res, state, 200);
        }
        catch (error) {
            next(error);
        }
    }
    static async selectPlayer(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            const { playerId, turnNumber } = req.body;
            if (!playerId || turnNumber === undefined) {
                throw { code: 'VALIDATION_ERROR', message: 'playerId and turnNumber are required', statusCode: 400 };
            }
            const result = await draft_service_1.DraftService.selectPlayer(id, userId, playerId, parseInt(turnNumber, 10));
            (0, response_1.sendSuccess)(res, result, 200);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.DraftController = DraftController;
