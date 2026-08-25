import { Router } from 'express';
import { ScoringController } from '../controllers/scoring.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router({ mergeParams: true });

router.get('/ranking', authenticate, ScoringController.getGameRankings);
router.get('/players/:playerId/points', authenticate, ScoringController.getPlayerPointsBreakdown);

export default router;
