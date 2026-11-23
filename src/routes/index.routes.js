import { Router } from 'express';
import authRoutes from './auth.routes.js';
import usuariosRoutes from './usuarios.routes.js';
import apartamentosRoutes from './apartamentos.routes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'SíndicoDigital API está funcionando'
  });
});

router.use('/auth', authRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/apartamentos', apartamentosRoutes);

export default router;