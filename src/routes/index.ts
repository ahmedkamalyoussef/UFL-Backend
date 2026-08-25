import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import walletRoutes from './wallet.routes';
import { competitionsRouter, matchesRouter } from './football.routes';
import gameRoutes from './game.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/', userRoutes);
router.use('/wallet', walletRoutes);
router.use('/competitions', competitionsRouter);
router.use('/matches', matchesRouter);
router.use('/games', gameRoutes);

export default router;
