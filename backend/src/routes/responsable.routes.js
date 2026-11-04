import { Router } from 'express';
import * as controller from '../controllers/responsable.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { ROLES } from '../constants/index.js';
import { mongoIdParam } from '../validators/common.validators.js';
import {
  actualizarResponsableRules,
  asociarPacienteRules,
  crearResponsableRules,
  desasociarPacienteRules,
  listarResponsablesRules
} from '../validators/responsable.validators.js';

const router = Router();

router.use(authenticate, authorize(ROLES.ADMINISTRADOR, ROLES.RECEPCIONISTA));

router.get('/', validate(listarResponsablesRules), controller.listar);
router.get('/:id', validate([mongoIdParam()]), controller.obtener);
router.post('/', validate(crearResponsableRules), controller.crear);
router.put('/:id', validate(actualizarResponsableRules), controller.actualizar);
router.post('/:id/pacientes', validate(asociarPacienteRules), controller.asociarPaciente);
router.delete('/:id/pacientes/:pacienteId', validate(desasociarPacienteRules), controller.desasociarPaciente);

export default router;
