import { Router } from 'express';
import {
  atualizar,
  buscar,
  criar,
  excluir,
  listar
} from '../controllers/usuarios.controller.js';
import { autenticar } from '../middlewares/auth.middleware.js';
import { exigirTipo } from '../middlewares/tipo.middleware.js';

const router = Router();
const somenteGestores = exigirTipo('SINDICO', 'ADMIN');

router.use(autenticar);

router.get('/', somenteGestores, listar);
router.post('/', somenteGestores, criar);
router.get('/:id', buscar);
router.put('/:id', atualizar);
router.delete('/:id', somenteGestores, excluir);

export default router;
