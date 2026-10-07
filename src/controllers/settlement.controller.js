"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettlementController = void 0;
const settlement_service_1 = require("../services/settlement.service");
const response_1 = require("../utils/response");
class SettlementController {
    static async settleGame(req, res, next) {
        try {
            const { id } = req.params;
            const result = await settlement_service_1.SettlementService.settleGame(id);
            (0, response_1.sendSuccess)(res, result, 200);
        }
        catch (error) {
            next(error);
        }
    }
    static async getGameResult(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user?.userId;
            const result = await settlement_service_1.SettlementService.getGameResult(id, userId);
            (0, response_1.sendSuccess)(res, result, 200);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.SettlementController = SettlementController;
