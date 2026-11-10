"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.optionalAuthenticate = optionalAuthenticate;
exports.requireAdmin = requireAdmin;
const jwt_1 = require("../utils/jwt");
const response_1 = require("../utils/response");

function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        (0, response_1.sendError)(res, 'UNAUTHORIZED', 'Authentication token required', 401);
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = (0, jwt_1.verifyToken)(token);
        req.user = payload;
        next();
    }
    catch (err) {
        (0, response_1.sendError)(res, 'UNAUTHORIZED', 'Invalid or expired token', 401);
        return;
    }
}

function optionalAuthenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const payload = (0, jwt_1.verifyToken)(token);
            req.user = payload;
        } catch (_) {
            // Ignore token parse failure for optional auth
        }
    }
    next();
}

function requireAdmin(req, res, next) {
    if (!req.user) {
        (0, response_1.sendError)(res, 'UNAUTHORIZED', 'Authentication token required', 401);
        return;
    }
    if (req.user.role !== 'admin') {
        (0, response_1.sendError)(res, 'FORBIDDEN', 'Admin privileges required', 403);
        return;
    }
    next();
}
