import { Router } from 'express';
import { GameController } from '../controllers/game.controller';
import { authenticate } from '../middleware/auth.middleware';
import draftRoutes from './draft.routes';
import scoringRoutes from './scoring.routes';

const router = Router();

router.get('/', GameController.getGames);
router.post('/', GameController.createGame);
router.get('/:id', GameController.getGameById);
router.post('/:id/join', authenticate, GameController.joinGame);
router.post('/:id/cancel', GameController.cancelGame);

// Mount draft and scoring endpoints under /games/:id
router.use('/:id', draftRoutes);
router.use('/:id', scoringRoutes);

export default router;
