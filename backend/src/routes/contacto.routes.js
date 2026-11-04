import { Router } from 'express';
import * as controller from '../controllers/contacto.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { limitadorFormularios } from '../middlewares/rateLimit.js';
import { ROLES } from '../constants/index.js';
import { mongoIdParam } from '../validators/common.validators.js';
import { crearMensajeRules, listarMensajesRules } from '../validators/contacto.validators.js';

const router = Router();
const soloAdmin = [authenticate, authorize(ROLES.ADMINISTRADOR)];

router.post('/', limitadorFormularios, validate(crearMensajeRules), controller.crear);
router.get('/', soloAdmin, validate(listarMensajesRules), controller.listar);
router.patch('/:id/leido', soloAdmin, validate([mongoIdParam()]), controller.marcarLeido);

export default router;
