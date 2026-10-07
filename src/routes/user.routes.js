"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get('/me', auth_middleware_1.authenticate, user_controller_1.UserController.getProfile);
router.get('/users/me/games', auth_middleware_1.authenticate, user_controller_1.UserController.getGameHistory);
exports.default = router;
