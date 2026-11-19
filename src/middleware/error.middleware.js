"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const response_1 = require("../utils/response");

function errorHandler(err, _req, res, _next) {
    if (err instanceof zod_1.ZodError) {
        console.error('[Error Handler] Validation Error:', err.errors);
        const firstMessage = (err.errors && err.errors.length > 0 && err.errors[0].message)
            ? err.errors[0].message
            : 'Invalid request parameters';
        (0, response_1.sendError)(res, 'VALIDATION_ERROR', firstMessage, 400, err.errors);
        return;
    }

    if (err.name === 'SequelizeUniqueConstraintError') {
        console.error('[Error Handler] Unique Constraint Error:', err.errors);
        const firstMessage = (err.errors && err.errors.length > 0 && err.errors[0].message)
            ? err.errors[0].message
            : 'A record with this information already exists';
        (0, response_1.sendError)(res, 'DUPLICATE_ENTRY', firstMessage, 409);
        return;
    }

    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        (0, response_1.sendError)(res, 'UNAUTHORIZED', 'Invalid or expired session token', 401);
        return;
    }

    if (err.name === 'MulterError') {
        (0, response_1.sendError)(res, 'FILE_UPLOAD_ERROR', err.message || 'File upload error', 400);
        return;
    }

    console.error('[Error Handler]', err);
    const statusCode = err.statusCode || (typeof err.status === 'number' ? err.status : 500);
    const errorCode = err.code || 'INTERNAL_SERVER_ERROR';
    const message = err.message || 'An unexpected internal error occurred';
    (0, response_1.sendError)(res, errorCode, message, statusCode);
}

