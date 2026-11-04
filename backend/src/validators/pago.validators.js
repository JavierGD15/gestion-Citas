import { body, param, query } from 'express-validator';
import { ESTADOS_PAGO, METODOS_PAGO } from '../constants/index.js';
import { moneyRule, mongoIdParam } from './common.validators.js';
import { esFechaValida } from '../utils/fechas.js';

const fechaQuery = (campo) =>
  query(campo)
    .optional()
    .custom((valor) => esFechaValida(valor))
    .withMessage('Ingrese una fecha válida con formato AAAA-MM-DD');

export const registrarPagoRules = [
  body('cita').isMongoId().withMessage('Seleccione una cita válida'),
  moneyRule('monto', { min: 0.01, mensaje: 'El monto debe ser mayor a cero y tener máximo dos decimales' }),
  body('metodo').isIn(Object.values(METODOS_PAGO)).withMessage('Método de pago no válido'),
  body('referencia').optional().isString().trim().isLength({ max: 60 }).withMessage('La referencia no debe superar 60 caracteres'),
  body('observaciones').optional().isString().trim().isLength({ max: 500 }).withMessage('Las observaciones no deben superar 500 caracteres')
];

export const anularPagoRules = [
  mongoIdParam(),
  body('motivo').trim().isLength({ min: 10, max: 500 }).withMessage('Indique la justificación de la anulación (mínimo 10 caracteres)')
];

export const listarPagosRules = [
  ...['paciente', 'cita', 'caja', 'registradoPor'].map((campo) => query(campo).optional().isMongoId().withMessage(`El filtro ${campo} no es válido`)),
  query('metodo').optional().isIn(Object.values(METODOS_PAGO)).withMessage('Método no válido'),
  query('estado').optional().isIn(Object.values(ESTADOS_PAGO)).withMessage('Estado no válido'),
  query('comprobante').optional().isString().trim().isLength({ max: 30 }),
  fechaQuery('fecha'),
  fechaQuery('desde'),
  fechaQuery('hasta'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
];

export const comprobanteRules = [param('numero').matches(/^REC-\d{4}-\d{6}$/i).withMessage('Número de comprobante no válido')];

export const saldosPendientesRules = [
  query('paciente').optional().isMongoId().withMessage('Paciente no válido'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
];
