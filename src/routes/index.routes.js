import { Router } from 'express';
import authRoutes from './auth.routes.js';
import comunicadosRoutes from './comunicados.routes.js';
import usuariosRoutes from './usuarios.routes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'SíndicoDigital API está funcionando'
  });
});

router.use('/auth', authRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/comunicados', comunicadosRoutes);

export default router;