import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import walletRoutes from './wallet.routes';
import { competitionsRouter, matchesRouter } from './football.routes';
import gameRoutes from './game.routes';
import syncRoutes from './sync.routes';
import rankingRoutes from './ranking.routes';
import notificationRoutes from './notification.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/', userRoutes);
router.use('/wallet', walletRoutes);
router.use('/competitions', competitionsRouter);
router.use('/matches', matchesRouter);
router.use('/games', gameRoutes);
router.use('/sync', syncRoutes);
router.use('/', rankingRoutes);
router.use('/', notificationRoutes);

export default router;
