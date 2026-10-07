"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
const response_1 = require("../utils/response");
class UserController {
    static async getProfile(req, res, next) {
        try {
            const userId = req.user.userId;
            const profile = await user_service_1.UserService.getUserProfile(userId);
            (0, response_1.sendSuccess)(res, profile, 200);
        }
        catch (error) {
            next(error);
        }
    }
    static async getGameHistory(req, res, next) {
        try {
            const userId = req.user.userId;
            const page = req.query.page ? parseInt(req.query.page, 10) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
            const history = await user_service_1.UserService.getUserGameHistory(userId, page, limit);
            (0, response_1.sendSuccess)(res, history, 200);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UserController = UserController;
