import { Router } from 'express';
import { login, logout, me, signup } from '../controllers/auth.controller.js';
import { autenticar } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', autenticar, me);
router.post('/logout', autenticar, logout);

export default router;
