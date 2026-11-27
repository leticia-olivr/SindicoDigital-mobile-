import { Router } from 'express';
import authRoutes from './auth.routes.js';
import comunicadosRoutes from './comunicados.routes.js';
import usuariosRoutes from './usuarios.routes.js';
import sindicosRoutes from './sindicos.routes.js';
import unidadesRoutes from './unidades.routes.js';
import categoriasRoutes from './categorias.routes.js';
import ocorrenciasRoutes from './ocorrencias.routes.js';
import apartamentosRoutes from './apartamentos.routes.js';
import condominiosRoutes from './condominios.routes.js';

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
router.use('/ocorrencias', ocorrenciasRoutes);
router.use('/apartamentos', apartamentosRoutes);
router.use('/condominios', condominiosRoutes);
router.use('/comunicados', comunicadosRoutes);

export default router;
