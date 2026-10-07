"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const scoring_controller_1 = require("../controllers/scoring.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)({ mergeParams: true });
router.get('/ranking', auth_middleware_1.authenticate, scoring_controller_1.ScoringController.getGameRankings);
router.get('/players/:playerId/points', auth_middleware_1.authenticate, scoring_controller_1.ScoringController.getPlayerPointsBreakdown);
exports.default = router;
