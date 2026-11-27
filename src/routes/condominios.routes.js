import { Router } from 'express';

import { criar, listar } from '../controllers/condominios.controller.js';
import { autenticar } from '../middlewares/auth.middleware.js';
import { exigirTipo } from '../middlewares/tipo.middleware.js';

const router = Router();

router.use(autenticar);

// Somente ADMIN lista e cria condomínios.
router.get('/', exigirTipo('ADMIN'), listar);
router.post('/', exigirTipo('ADMIN'), criar);

export default router;
