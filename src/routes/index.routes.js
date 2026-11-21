import { Router } from 'express';
import authRoutes from './auth.routes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'SíndicoDigital API está funcionando'
  });
});

router.use('/auth', authRoutes);

export default router;