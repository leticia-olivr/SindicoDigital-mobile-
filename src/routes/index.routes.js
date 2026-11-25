import { Router } from 'express';
import authRoutes from './auth.routes.js';
import usuariosRoutes from './usuarios.routes.js';
import sindicosRoutes from './sindicos.routes.js';
import unidadesRoutes from './unidades.routes.js';
import categoriasRoutes from './categorias.routes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'SindicoDigital API está funcionando'
  });
});

router.use('/auth', authRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/sindicos', sindicosRoutes);
router.use('/unidades', unidadesRoutes);
router.use('/categorias', categoriasRoutes);

export default router;
