import { body, query } from 'express-validator';
import { ROLES, ESTADOS } from '../constants/index.js';
import { correoRule, mongoIdParam, passwordRule } from './common.validators.js';

const nombreRule = (campo, etiqueta) =>
  body(campo).trim().isLength({ min: 2, max: 80 }).withMessage(`${etiqueta} debe tener entre 2 y 80 caracteres`);

export const listarUsuariosRules = [
  query('rol').optional().isIn(Object.values(ROLES)).withMessage('Rol no válido'),
  query('estado').optional().isIn(Object.values(ESTADOS)).withMessage('Estado no válido'),
  query('q').optional().isString().trim().isLength({ max: 80 })
];

export const crearUsuarioRules = [
  nombreRule('nombres', 'Los nombres'),
  nombreRule('apellidos', 'Los apellidos'),
  correoRule(),
  passwordRule(),
  body('rol').isIn(Object.values(ROLES)).withMessage('Rol no válido')
];

export const actualizarUsuarioRules = [
  mongoIdParam(),
  nombreRule('nombres', 'Los nombres').optional(),
  nombreRule('apellidos', 'Los apellidos').optional(),
  correoRule().optional(),
  body('rol').optional().isIn(Object.values(ROLES)).withMessage('Rol no válido')
];

export const estadoUsuarioRules = [
  mongoIdParam(),
  body('estado').isIn(Object.values(ESTADOS)).withMessage('Estado no válido')
];

export const restablecerPasswordRules = [mongoIdParam(), passwordRule()];
