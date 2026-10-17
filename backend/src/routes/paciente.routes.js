import { Router } from 'express';
import * as controller from '../controllers/paciente.controller.js';
import * as responsableController from '../controllers/responsable.controller.js';
import * as citaController from '../controllers/cita.controller.js';
import * as materialController from '../controllers/material.controller.js';
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
const todos = authorize(ROLES.ADMINISTRADOR, ROLES.RECEPCIONISTA, ROLES.PROFESIONAL);

router.use(authenticate);

router.get('/', todos, validate(listarPacientesRules), controller.listar);
router.get('/:id', todos, validate([mongoIdParam()]), controller.obtener);
router.post('/', gestion, validate(crearPacienteRules), controller.crear);
router.put('/:id', gestion, validate(actualizarPacienteRules), controller.actualizar);
router.patch('/:id/estado', gestion, validate(estadoPacienteRules), controller.cambiarEstado);
router.get('/:id/responsables', gestion, validate([mongoIdParam()]), responsableController.listarPorPaciente);
router.get('/:id/citas', todos, validate([mongoIdParam()]), citaController.historialPaciente);
router.get(
  '/:id/materiales',
  authorize(ROLES.ADMINISTRADOR, ROLES.PROFESIONAL),
  validate([mongoIdParam()]),
  materialController.asignacionesPorPaciente
);

export default router;
