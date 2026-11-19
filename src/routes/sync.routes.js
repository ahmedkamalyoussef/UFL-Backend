"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sync_controller_1 = require("../controllers/sync.controller");
const response_1 = require("../utils/response");
const router = (0, express_1.Router)();
// Internal / Admin secret guard middleware
const adminGuard = (req, res, next) => {
    const adminKey = req.headers['x-admin-key'];
    if (process.env.NODE_ENV === 'development' || adminKey === 'ufl-dev-admin-secret') {
        return next();
    }
    return (0, response_1.sendError)(res, 'FORBIDDEN', 'Forbidden manual sync endpoint access', 403);
};
router.post('/run', adminGuard, sync_controller_1.SyncController.triggerSync);
exports.default = router;
