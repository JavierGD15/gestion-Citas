import { Router } from 'express';
import * as controller from '../controllers/profesional.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { ROLES } from '../constants/index.js';
import { mongoIdParam } from '../validators/common.validators.js';
import {
  actualizarProfesionalRules,
  crearProfesionalRules,
  estadoProfesionalRules,
  listarProfesionalesRules
} from '../validators/profesional.validators.js';

const router = Router();
const soloAdmin = authorize(ROLES.ADMINISTRADOR);
const consulta = authorize(ROLES.ADMINISTRADOR, ROLES.RECEPCIONISTA);

router.use(authenticate);

router.get('/me', authorize(ROLES.PROFESIONAL), controller.miPerfil);
router.get('/', consulta, validate(listarProfesionalesRules), controller.listar);
router.get('/:id', consulta, validate([mongoIdParam()]), controller.obtener);
router.post('/', soloAdmin, validate(crearProfesionalRules), controller.crear);
router.put('/:id', soloAdmin, validate(actualizarProfesionalRules), controller.actualizar);
router.patch('/:id/estado', soloAdmin, validate(estadoProfesionalRules), controller.cambiarEstado);

export default router;
