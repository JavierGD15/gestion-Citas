import { Router } from 'express';
import * as controller from '../controllers/caja.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { ROLES } from '../constants/index.js';
import { mongoIdParam } from '../validators/common.validators.js';
import { abrirCajaRules, cerrarCajaRules, listarCajasRules } from '../validators/caja.validators.js';

const router = Router();

router.use(authenticate, authorize(ROLES.ADMINISTRADOR, ROLES.RECEPCIONISTA));

router.post('/abrir', validate(abrirCajaRules), controller.abrir);
router.get('/actual', controller.actual);
router.get('/', validate(listarCajasRules), controller.listar);
router.get('/:id', validate([mongoIdParam()]), controller.obtener);
router.get('/:id/movimientos', validate([mongoIdParam()]), controller.movimientos);
router.post('/:id/cerrar', validate(cerrarCajaRules), controller.cerrar);

export default router;
