import { Router } from 'express';
import * as controller from '../controllers/servicio.controller.js';
import { authenticate, authorize, optionalAuthenticate } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { ROLES } from '../constants/index.js';
import { mongoIdParam } from '../validators/common.validators.js';
import {
  actualizarServicioRules,
  crearServicioRules,
  estadoServicioRules,
  listarServiciosRules
} from '../validators/servicio.validators.js';

const router = Router();
const soloAdmin = [authenticate, authorize(ROLES.ADMINISTRADOR)];

router.get('/', optionalAuthenticate, validate(listarServiciosRules), controller.listar);
router.get('/:id', optionalAuthenticate, validate([mongoIdParam()]), controller.obtener);
router.post('/', soloAdmin, validate(crearServicioRules), controller.crear);
router.put('/:id', soloAdmin, validate(actualizarServicioRules), controller.actualizar);
router.patch('/:id/estado', soloAdmin, validate(estadoServicioRules), controller.cambiarEstado);

export default router;
