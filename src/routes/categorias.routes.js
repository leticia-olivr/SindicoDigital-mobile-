import { Router } from 'express';
import { criarCategoria, listarCategorias, consultarCategoriaPorId, atualizarCategoria, excluirCategoria } from '../controllers/categorias.controller.js';
import { autenticar } from '../middlewares/auth.middleware.js';
import { exigirTipo } from '../middlewares/tipo.middleware.js';

const router = Router();

router.use(autenticar);
router.post('/', exigirTipo('ADMIN', 'SINDICO'), criarCategoria);
router.get('/', listarCategorias);
router.get('/:id', consultarCategoriaPorId);
router.put('/:id', exigirTipo('ADMIN', 'SINDICO'), atualizarCategoria);
router.delete('/:id', exigirTipo('ADMIN', 'SINDICO'), excluirCategoria);

export default router;
