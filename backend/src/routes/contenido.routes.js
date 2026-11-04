import { Router } from 'express';
import { query } from 'express-validator';
import * as controller from '../controllers/contenido.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { ROLES, TIPOS_CONTENIDO } from '../constants/index.js';
import {
  actualizarContenidoRules,
  crearContenidoRules,
  estadoContenidoRules,
  listarContenidoAdminRules
} from '../validators/contenido.validators.js';

const router = Router();
const soloAdmin = [authenticate, authorize(ROLES.ADMINISTRADOR)];

router.get('/', validate([query('tipo').optional().isIn(Object.values(TIPOS_CONTENIDO)).withMessage('Tipo no válido')]), controller.listar);
router.get('/publico', controller.publico);
router.get('/admin', soloAdmin, validate(listarContenidoAdminRules), controller.listarAdmin);
router.post('/', soloAdmin, validate(crearContenidoRules), controller.crear);
router.put('/:id', soloAdmin, validate(actualizarContenidoRules), controller.actualizar);
router.patch('/:id/estado', soloAdmin, validate(estadoContenidoRules), controller.cambiarEstado);

export default router;
