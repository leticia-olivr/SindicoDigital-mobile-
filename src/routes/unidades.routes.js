import { Router } from 'express';
import {
  associarMorador,
  desassociarMorador,
  listarMoradores
} from '../controllers/unidades.controller.js';
import { autenticar } from '../middlewares/auth.middleware.js';
import { exigirTipo } from '../middlewares/tipo.middleware.js';

const router = Router();

router.use(autenticar);

const gestores = exigirTipo('ADMIN', 'SINDICO');

router.get('/:unidadeId/moradores', gestores, listarMoradores);
router.post('/:unidadeId/moradores/:usuarioId', gestores, associarMorador);
router.delete('/:unidadeId/moradores/:usuarioId', gestores, desassociarMorador);

export default router;
