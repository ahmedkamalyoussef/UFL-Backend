import { Router } from 'express';
import { WalletController } from '../controllers/wallet.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, WalletController.getWallet);
router.get('/transactions', authenticate, WalletController.getTransactions);

export default router;
