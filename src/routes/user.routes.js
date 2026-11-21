"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();

router.get('/me', auth_middleware_1.authenticate, user_controller_1.UserController.getProfile);
router.put('/me', auth_middleware_1.authenticate, user_controller_1.UserController.updateProfile);
router.patch('/me', auth_middleware_1.authenticate, user_controller_1.UserController.updateProfile);
router.put('/me/avatar', auth_middleware_1.authenticate, user_controller_1.UserController.updateAvatar);
router.patch('/me/avatar', auth_middleware_1.authenticate, user_controller_1.UserController.updateAvatar);
router.put('/me/password', auth_middleware_1.authenticate, user_controller_1.UserController.changePassword);
router.post('/me/change-password', auth_middleware_1.authenticate, user_controller_1.UserController.changePassword);
router.delete('/me', auth_middleware_1.authenticate, user_controller_1.UserController.deleteAccount);
router.get('/users/me/games', auth_middleware_1.authenticate, user_controller_1.UserController.getGameHistory);

exports.default = router;
