"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ranking_controller_1 = require("../controllers/ranking.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const response_1 = require("../utils/response");
const router = (0, express_1.Router)();
// Internal / Admin secret guard middleware for season mutations
const adminGuard = (req, res, next) => {
    const adminKey = req.headers['x-admin-key'];
    if (process.env.NODE_ENV === 'development' || adminKey === 'ufl-dev-admin-secret') {
        return next();
    }
    return (0, response_1.sendError)(res, 'FORBIDDEN', 'Forbidden season management endpoint access', 403);
};
// Global Leaderboard & User Rank routes
router.get('/ranking', ranking_controller_1.RankingController.getGlobalLeaderboard);
router.get('/ranking/me', auth_middleware_1.authenticate, ranking_controller_1.RankingController.getCurrentUserRank);
// Season routes
router.get('/seasons', ranking_controller_1.RankingController.getSeasons);
router.get('/seasons/:seasonId/ranking', ranking_controller_1.RankingController.getSeasonLeaderboard);
router.post('/seasons', adminGuard, ranking_controller_1.RankingController.createSeason);
router.post('/seasons/:seasonId/activate', adminGuard, ranking_controller_1.RankingController.activateSeason);
exports.default = router;
