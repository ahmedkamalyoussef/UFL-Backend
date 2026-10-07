"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const response_1 = require("../utils/response");
function errorHandler(err, _req, res, _next) {
    if (err instanceof zod_1.ZodError) {
        console.error('[Error Handler] Validation Error:', err.errors);
        (0, response_1.sendError)(res, 'VALIDATION_ERROR', 'Invalid request parameters', 400, err.errors);
        return;
    }
    console.error('[Error Handler]', err);
    const statusCode = err.statusCode || 500;
    const errorCode = err.code || 'INTERNAL_SERVER_ERROR';
    const message = err.message || 'An unexpected internal error occurred';
    (0, response_1.sendError)(res, errorCode, message, statusCode);
}
