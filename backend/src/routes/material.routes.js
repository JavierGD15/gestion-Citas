import { Router } from 'express';
import * as controller from '../controllers/material.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { ROLES } from '../constants/index.js';
import { mongoIdParam } from '../validators/common.validators.js';
import {
  actualizarMaterialRules,
  asignarMaterialRules,
  crearMaterialRules,
  estadoMaterialRules,
  listarMaterialesRules,
  retirarAsignacionRules
} from '../validators/material.validators.js';

const router = Router();
const soloAdmin = authorize(ROLES.ADMINISTRADOR);
const asignadores = authorize(ROLES.ADMINISTRADOR, ROLES.PROFESIONAL);

router.use(authenticate);

router.get('/', asignadores, validate(listarMaterialesRules), controller.listar);
router.patch('/asignaciones/:asignacionId/retirar', asignadores, validate(retirarAsignacionRules), controller.retirarAsignacion);
router.get('/:id', asignadores, validate([mongoIdParam()]), controller.obtener);
router.post('/', soloAdmin, validate(crearMaterialRules), controller.crear);
router.put('/:id', soloAdmin, validate(actualizarMaterialRules), controller.actualizar);
router.patch('/:id/estado', soloAdmin, validate(estadoMaterialRules), controller.cambiarEstado);
router.get('/:id/asignaciones', asignadores, validate([mongoIdParam()]), controller.asignacionesPorMaterial);
router.post('/:id/asignaciones', asignadores, validate(asignarMaterialRules), controller.asignar);

export default router;
