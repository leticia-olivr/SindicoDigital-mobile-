import { Router } from 'express';
import { criarCategoria, listarCategorias } from '../controllers/categorias.controller.js';
import { autenticar } from '../middlewares/auth.middleware.js';
import { exigirTipo } from '../middlewares/tipo.middleware.js';

const router = Router();

router.use(autenticar);
router.post('/', exigirTipo('ADMIN', 'SINDICO'), criarCategoria);
router.get('/', listarCategorias);

export default router;
