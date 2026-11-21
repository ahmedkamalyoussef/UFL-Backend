"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
const response_1 = require("../utils/response");
const auth_validator_1 = require("../validators/auth.validator");

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

    static async updateProfile(req, res, next) {
        try {
            const userId = req.user.userId;
            const validated = auth_validator_1.updateProfileSchema.parse(req.body);
            const updated = await user_service_1.UserService.updateProfile(userId, validated);
            (0, response_1.sendSuccess)(res, updated, 200);
        }
        catch (error) {
            next(error);
        }
    }

    static async changePassword(req, res, next) {
        try {
            const userId = req.user.userId;
            const validated = auth_validator_1.changePasswordSchema.parse(req.body);
            const result = await user_service_1.UserService.changePassword(userId, validated);
            (0, response_1.sendSuccess)(res, result, 200);
        }
        catch (error) {
            next(error);
        }
    }

    static async deleteAccount(req, res, next) {
        try {
            const userId = req.user.userId;
            const validated = auth_validator_1.deleteAccountSchema.parse(req.body);
            const result = await user_service_1.UserService.deleteAccount(userId, validated.password);
            (0, response_1.sendSuccess)(res, result, 200);
        }
        catch (error) {
            next(error);
        }
    }

    static async updateAvatar(req, res, next) {
        try {
            const userId = req.user.userId;
            const { avatarUrl } = req.body;
            if (!avatarUrl) {
                (0, response_1.sendError)(res, 'VALIDATION_ERROR', 'avatarUrl is required', 400);
                return;
            }
            const updated = await user_service_1.UserService.updateAvatar(userId, avatarUrl);
            (0, response_1.sendSuccess)(res, updated, 200);
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
