import { Router } from 'express';

import { listar } from '../controllers/condominios.controller.js';
import { autenticar } from '../middlewares/auth.middleware.js';
import { exigirTipo } from '../middlewares/tipo.middleware.js';

const router = Router();

router.use(autenticar);

// Somente ADMIN lista todos os condomínios.
router.get('/', exigirTipo('ADMIN'), listar);

export default router;
