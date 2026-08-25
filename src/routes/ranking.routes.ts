import { Router, Request, Response, NextFunction } from 'express';
import { RankingController } from '../controllers/ranking.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Internal / Admin secret guard middleware for season mutations
const adminGuard = (req: Request, res: Response, next: NextFunction) => {
  const adminKey = req.headers['x-admin-key'];
  if (process.env.NODE_ENV === 'development' || adminKey === 'ufl-dev-admin-secret') {
    return next();
  }
  return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Forbidden season management endpoint access' } });
};

// Global Leaderboard & User Rank routes
router.get('/ranking', RankingController.getGlobalLeaderboard);
router.get('/ranking/me', authenticate, RankingController.getCurrentUserRank);

// Season routes
router.get('/seasons', RankingController.getSeasons);
router.get('/seasons/:seasonId/ranking', RankingController.getSeasonLeaderboard);
router.post('/seasons', adminGuard, RankingController.createSeason);
router.post('/seasons/:seasonId/activate', adminGuard, RankingController.activateSeason);

export default router;
