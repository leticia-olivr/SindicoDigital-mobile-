import { Router } from 'express';
import { 
    registrarOcorrencia, 
    listarOcorrencias, 
    consultarOcorrencia,
    atualizarOcorrenciaController,
    excluirOcorrenciaController
} from '../controllers/ocorrencias.controller.js';
import { autenticar } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(autenticar);
router.post('/', registrarOcorrencia);
router.get('/', listarOcorrencias);
router.get('/:id', consultarOcorrencia);
router.put('/:id', atualizarOcorrenciaController);
router.delete('/:id', excluirOcorrenciaController);

export default router;
