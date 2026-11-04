import { Router } from 'express';
import * as controller from '../controllers/solicitud.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { ROLES } from '../constants/index.js';
import { mongoIdParam } from '../validators/common.validators.js';
import { crearSolicitudRules, listarSolicitudesRules, rechazarSolicitudRules } from '../validators/solicitud.validators.js';
import { convertirSolicitudRules } from '../validators/cita.validators.js';

const router = Router();
const gestion = [authenticate, authorize(ROLES.ADMINISTRADOR, ROLES.RECEPCIONISTA)];

router.post('/', validate(crearSolicitudRules), controller.crear);
router.get('/', gestion, validate(listarSolicitudesRules), controller.listar);
router.get('/:id', gestion, validate([mongoIdParam()]), controller.obtener);
router.patch('/:id/rechazar', gestion, validate(rechazarSolicitudRules), controller.rechazar);
router.post('/:id/convertir', gestion, validate(convertirSolicitudRules), controller.convertir);

export default router;
