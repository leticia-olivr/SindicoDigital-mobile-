import { Router } from 'express';

import {
  associar,
  desassociar,
  listarMeusCondominios
} from '../controllers/sindicos.controller.js';

import { autenticar } from '../middlewares/auth.middleware.js';
import { exigirTipo } from '../middlewares/tipo.middleware.js';

const router = Router();

router.use(autenticar);

// Síndico consulta seus próprios condomínios.
router.get(
  '/me/condominios',
  exigirTipo('SINDICO'),
  listarMeusCondominios
);

// Somente ADMIN pode criar ou remover associações.
router.post(
  '/:sindicoId/condominios/:condominioId',
  exigirTipo('ADMIN'),
  associar
);

router.delete(
  '/:sindicoId/condominios/:condominioId',
  exigirTipo('ADMIN'),
  desassociar
);

export default router;
