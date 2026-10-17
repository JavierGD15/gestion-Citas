import { Router } from 'express';
import * as controller from '../controllers/paciente.controller.js';
import * as responsableController from '../controllers/responsable.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { ROLES } from '../constants/index.js';
import { mongoIdParam } from '../validators/common.validators.js';
import {
  actualizarPacienteRules,
  crearPacienteRules,
  estadoPacienteRules,
  listarPacientesRules
} from '../validators/paciente.validators.js';

const router = Router();
const gestion = authorize(ROLES.ADMINISTRADOR, ROLES.RECEPCIONISTA);

router.use(authenticate);

router.get('/', gestion, validate(listarPacientesRules), controller.listar);
router.get('/:id', gestion, validate([mongoIdParam()]), controller.obtener);
router.post('/', gestion, validate(crearPacienteRules), controller.crear);
router.put('/:id', gestion, validate(actualizarPacienteRules), controller.actualizar);
router.patch('/:id/estado', gestion, validate(estadoPacienteRules), controller.cambiarEstado);
router.get('/:id/responsables', gestion, validate([mongoIdParam()]), responsableController.listarPorPaciente);

export default router;
