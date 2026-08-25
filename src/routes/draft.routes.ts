import { Router } from 'express';
import { DraftController } from '../controllers/draft.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router({ mergeParams: true });

router.get('/draft', authenticate, DraftController.getDraftState);
router.post('/draft/start', DraftController.startDraft);
router.post('/draft/select', authenticate, DraftController.selectPlayer);

export default router;
