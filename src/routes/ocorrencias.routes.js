import { Router } from 'express';

import {
  criarOcorrencia,
  listarOcorrencias,
  consultarOcorrencia
} from '../controllers/ocorrencias.controller.js';

import { autenticar } from '../middlewares/auth.middleware.js';
import { exigirTipo } from '../middlewares/tipo.middleware.js';

const router = Router();

router.use(autenticar);

router.post(
  '/',
  exigirTipo('ADMIN', 'SINDICO', 'MORADOR'),
  criarOcorrencia
);

router.get('/', listarOcorrencias);
router.get('/:id', consultarOcorrencia);

export default router;