import { Router } from 'express';
import * as controller from '../controllers/usuario.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { ROLES } from '../constants/index.js';
import { mongoIdParam } from '../validators/common.validators.js';
import {
  actualizarUsuarioRules,
  crearUsuarioRules,
  estadoUsuarioRules,
  listarUsuariosRules,
  restablecerPasswordRules
} from '../validators/usuario.validators.js';

const router = Router();

router.use(authenticate, authorize(ROLES.ADMINISTRADOR));

router.get('/', validate(listarUsuariosRules), controller.listar);
router.get('/:id', validate([mongoIdParam()]), controller.obtener);
router.post('/', validate(crearUsuarioRules), controller.crear);
router.put('/:id', validate(actualizarUsuarioRules), controller.actualizar);
router.patch('/:id/estado', validate(estadoUsuarioRules), controller.cambiarEstado);
router.patch('/:id/password', validate(restablecerPasswordRules), controller.restablecerPassword);

export default router;
