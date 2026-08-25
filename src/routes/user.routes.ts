import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/me', authenticate, UserController.getProfile);
router.get('/users/me/games', authenticate, UserController.getGameHistory);

export default router;
