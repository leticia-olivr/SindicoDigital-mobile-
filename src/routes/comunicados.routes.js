
import { Router } from 'express';

import {
  atualizar,
  buscar,
  criar,
  excluir,
  listar,
  listarPorUsuario
} from '../controllers/comunicados.controller.js';

import { autenticar } from '../middlewares/auth.middleware.js';
import { exigirTipo } from '../middlewares/tipo.middleware.js';

const router = Router();

const somenteGestores = exigirTipo('SINDICO', 'ADMIN');

router.use(autenticar);

router.get('/', listar);
router.get('/meus', listarPorUsuario);
router.get('/:id', buscar);

router.post('/', somenteGestores, criar);
router.put('/:id', somenteGestores, atualizar);
router.delete('/:id', somenteGestores, excluir);

export default router;
