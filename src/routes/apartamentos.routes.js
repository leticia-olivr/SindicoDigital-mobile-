
import { Router } from 'express';

import {
  atualizar,
  buscar,
  criar,
  excluir,
  listar,
  listarMoradores,
  adicionarMorador,
  removerMorador
} from '../controllers/apartamentos.controller.js';

import { autenticar } from '../middlewares/auth.middleware.js';
import { exigirTipo } from '../middlewares/tipo.middleware.js';

const router = Router();

const somenteGestores = exigirTipo('SINDICO', 'ADMIN');

// Todas as rotas exigem autenticação e permissão de gestor.
router.use(autenticar);
router.use(somenteGestores);

// CRUD de apartamentos
router.get('/', listar);
router.post('/', criar);
router.get('/:id', buscar);
router.put('/:id', atualizar);
router.delete('/:id', excluir);

// Associação com moradores
router.get('/:id/moradores', listarMoradores);
router.post('/:id/moradores', adicionarMorador);
router.delete('/:id/moradores/:moradorId', removerMorador);

export default router;
