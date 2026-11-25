import { Router } from 'express';
import { criarCategoria } from '../controllers/categorias.controller.js';
import { autenticar } from '../middlewares/auth.middleware.js';
import { exigirTipo } from '../middlewares/tipo.middleware.js';

const router = Router();

router.use(autenticar);
router.post('/', exigirTipo('ADMIN', 'SINDICO'), criarCategoria);

export default router;
