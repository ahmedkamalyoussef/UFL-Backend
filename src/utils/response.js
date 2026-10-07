"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendError = sendError;
function sendSuccess(res, data, statusCode = 200) {
    const response = {
        success: true,
        data,
    };
    return res.status(statusCode).json(response);
}
function sendError(res, code, message, statusCode = 400, details) {
    const response = {
        success: false,
        error: {
            code,
            message,
            ...(details ? { details } : {}),
        },
    };
    return res.status(statusCode).json(response);
}
