"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const game_controller_1 = require("../controllers/game.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const draft_routes_1 = __importDefault(require("./draft.routes"));
const scoring_routes_1 = __importDefault(require("./scoring.routes"));
const settlement_routes_1 = __importDefault(require("./settlement.routes"));
const router = (0, express_1.Router)();
router.get('/', game_controller_1.GameController.getGames);
router.post('/', game_controller_1.GameController.createGame);
router.get('/:id', game_controller_1.GameController.getGameById);
router.post('/:id/join', auth_middleware_1.authenticate, game_controller_1.GameController.joinGame);
router.post('/:id/cancel', game_controller_1.GameController.cancelGame);
// Mount draft, scoring, and settlement endpoints under /games/:id
router.use('/:id', draft_routes_1.default);
router.use('/:id', scoring_routes_1.default);
router.use('/:id', settlement_routes_1.default);
exports.default = router;
