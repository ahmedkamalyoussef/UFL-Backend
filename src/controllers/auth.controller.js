"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_validator_1 = require("../validators/auth.validator");
const auth_service_1 = require("../services/auth.service");
const response_1 = require("../utils/response");
class AuthController {
    static async register(req, res, next) {
        try {
            console.log(req.body);
            const validatedInput = auth_validator_1.registerSchema.parse(req.body);
            const data = await auth_service_1.AuthService.register(validatedInput);
            (0, response_1.sendSuccess)(res, data, 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async login(req, res, next) {
        try {
            const validatedInput = auth_validator_1.loginSchema.parse(req.body);
            const data = await auth_service_1.AuthService.login(validatedInput);
            (0, response_1.sendSuccess)(res, data, 200);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
