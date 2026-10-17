import { Router } from 'express';
import * as controller from '../controllers/horario.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { ROLES } from '../constants/index.js';
import { actualizarHorariosRules } from '../validators/contenido.validators.js';

const router = Router();

router.get('/', controller.listar);
router.put('/', authenticate, authorize(ROLES.ADMINISTRADOR), validate(actualizarHorariosRules), controller.actualizar);

export default router;
