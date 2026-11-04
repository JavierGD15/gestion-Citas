import { body } from 'express-validator';
import { moneyRule } from './common.validators.js';

export const abrirCajaRules = [
  moneyRule('montoInicial', { mensaje: 'El monto inicial debe ser un monto válido mayor o igual a cero' }),
  body('observaciones').optional().isString().trim().isLength({ max: 500 }).withMessage('Las observaciones no deben superar 500 caracteres')
];
