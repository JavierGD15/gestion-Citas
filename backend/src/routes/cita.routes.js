import { Router } from 'express';
import * as controller from '../controllers/cita.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { ROLES } from '../constants/index.js';
import { mongoIdParam } from '../validators/common.validators.js';
import {
  actualizarCitaRules,
  calendarioRules,
  crearCitaRules,
  disponibilidadRules,
  estadoCitaRules,
  listarCitasRules
} from '../validators/cita.validators.js';

const router = Router();
const gestion = authorize(ROLES.ADMINISTRADOR, ROLES.RECEPCIONISTA);
const todos = authorize(ROLES.ADMINISTRADOR, ROLES.RECEPCIONISTA, ROLES.PROFESIONAL);

router.use(authenticate);

router.get('/', todos, validate(listarCitasRules), controller.listar);
router.get('/calendario', todos, validate(calendarioRules), controller.calendario);
router.get('/disponibilidad', gestion, validate(disponibilidadRules), controller.disponibilidad);
router.get('/:id', todos, validate([mongoIdParam()]), controller.obtener);
router.post('/', gestion, validate(crearCitaRules), controller.crear);
router.put('/:id', gestion, validate(actualizarCitaRules), controller.actualizar);
router.patch('/:id/estado', todos, validate(estadoCitaRules), controller.cambiarEstado);

export default router;
