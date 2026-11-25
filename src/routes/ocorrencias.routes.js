import { Router } from 'express';
import { registrarOcorrencia } from '../controllers/ocorrencias.controller.js';
import { autenticar } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(autenticar);
router.post('/', registrarOcorrencia);

export default router;
