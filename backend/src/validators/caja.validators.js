import { body, query } from 'express-validator';
import { ESTADOS_CAJA } from '../constants/index.js';
import { moneyRule, mongoIdParam } from './common.validators.js';
import { esFechaValida } from '../utils/fechas.js';

export const abrirCajaRules = [
  moneyRule('montoInicial', { mensaje: 'El monto inicial debe ser un monto válido mayor o igual a cero' }),
  body('observaciones').optional().isString().trim().isLength({ max: 500 }).withMessage('Las observaciones no deben superar 500 caracteres')
];

export const listarCajasRules = [
  query('estado').optional().isIn(Object.values(ESTADOS_CAJA)).withMessage('Estado no válido'),
  query('usuario').optional().isMongoId().withMessage('Usuario no válido'),
  query('desde').optional().custom((valor) => esFechaValida(valor)).withMessage('Fecha no válida'),
  query('hasta').optional().custom((valor) => esFechaValida(valor)).withMessage('Fecha no válida'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
];

export const cerrarCajaRules = [
  mongoIdParam(),
  moneyRule('efectivoContado', { mensaje: 'Ingrese el efectivo contado con máximo dos decimales' }),
  body('observaciones').optional().isString().trim().isLength({ max: 500 }).withMessage('Las observaciones no deben superar 500 caracteres')
];
