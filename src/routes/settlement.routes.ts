import { Router } from 'express';
import { SettlementController } from '../controllers/settlement.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router({ mergeParams: true });

router.get('/result', authenticate, SettlementController.getGameResult);
router.post('/settle', SettlementController.settleGame);

export default router;
