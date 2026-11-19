"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendError = sendError;
function sendSuccess(res, data, statusCode = 200, message = null) {
    const response = {
        success: true,
        ...(message ? { message } : {}),
        data,
    };
    return res.status(statusCode).json(response);
}
function sendError(res, code, message, statusCode = 400, details = null) {
    const response = {
        success: false,
        message,
        error: {
            code,
            message,
            ...(details ? { details } : {}),
        },
    };
    return res.status(statusCode).json(response);
}

