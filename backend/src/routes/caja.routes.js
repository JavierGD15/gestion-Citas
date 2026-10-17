import { Router } from 'express';
import * as controller from '../controllers/caja.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { ROLES } from '../constants/index.js';
import { abrirCajaRules } from '../validators/caja.validators.js';

const router = Router();

router.use(authenticate, authorize(ROLES.ADMINISTRADOR, ROLES.RECEPCIONISTA));

router.post('/abrir', validate(abrirCajaRules), controller.abrir);
router.get('/actual', controller.actual);

export default router;
