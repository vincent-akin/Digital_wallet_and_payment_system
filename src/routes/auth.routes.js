import { Router } from 'express';
import { register, login, updateUser, deactivateUser } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.patch('/update', authenticate, updateUser);
router.patch('/deactivate', authenticate, deactivateUser);

export default router;