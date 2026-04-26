import { Router } from 'express';
import { getWalletController, fundWalletController, transferController } from '../controllers/wallet.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// All wallet routes are protected
router.get('/', authenticate, getWalletController);
router.post('/fund', authenticate, fundWalletController);
router.post('/transfer', authenticate, transferController);

export default router;