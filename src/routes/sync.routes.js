"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sync_controller_1 = require("../controllers/sync.controller");
const router = (0, express_1.Router)();
// Internal / Admin secret guard middleware
const adminGuard = (req, res, next) => {
    const adminKey = req.headers['x-admin-key'];
    if (process.env.NODE_ENV === 'development' || adminKey === 'ufl-dev-admin-secret') {
        return next();
    }
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Forbidden manual sync endpoint access' } });
};
router.post('/run', adminGuard, sync_controller_1.SyncController.triggerSync);
exports.default = router;
