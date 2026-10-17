import { Router } from 'express';
import * as controller from '../controllers/pago.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { ROLES } from '../constants/index.js';
import { mongoIdParam } from '../validators/common.validators.js';
import {
  anularPagoRules,
  comprobanteRules,
  listarPagosRules,
  registrarPagoRules,
  saldosPendientesRules
} from '../validators/pago.validators.js';

const router = Router();

router.use(authenticate, authorize(ROLES.ADMINISTRADOR, ROLES.RECEPCIONISTA));

router.get('/', validate(listarPagosRules), controller.listar);
router.get('/saldos-pendientes', validate(saldosPendientesRules), controller.saldosPendientes);
router.get('/comprobante/:numero', validate(comprobanteRules), controller.porComprobante);
router.get('/:id', validate([mongoIdParam()]), controller.obtener);
router.post('/', validate(registrarPagoRules), controller.registrar);
router.patch('/:id/anular', validate(anularPagoRules), controller.anular);

export default router;
