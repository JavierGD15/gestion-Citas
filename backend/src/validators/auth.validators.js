import { body } from 'express-validator';
import { correoRule, passwordRule } from './common.validators.js';

export const loginRules = [
  correoRule(),
  body('password').isString().notEmpty().withMessage('La contraseña es obligatoria')
];

export const cambiarPasswordRules = [
  body('passwordActual').isString().notEmpty().withMessage('La contraseña actual es obligatoria'),
  passwordRule('passwordNueva')
];
