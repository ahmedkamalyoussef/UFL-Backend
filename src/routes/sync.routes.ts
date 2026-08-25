import { Router, Request, Response, NextFunction } from 'express';
import { SyncController } from '../controllers/sync.controller';

const router = Router();

// Internal / Admin secret guard middleware
const adminGuard = (req: Request, res: Response, next: NextFunction) => {
  const adminKey = req.headers['x-admin-key'];
  if (process.env.NODE_ENV === 'development' || adminKey === 'ufl-dev-admin-secret') {
    return next();
  }
  return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Forbidden manual sync endpoint access' } });
};

router.post('/run', adminGuard, SyncController.triggerSync);

export default router;
