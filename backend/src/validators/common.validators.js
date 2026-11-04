import { body, param } from 'express-validator';
import { isValidMoney } from '../utils/money.js';

export const PASSWORD_MENSAJE = 'La contraseña debe tener al menos 8 caracteres e incluir letras y números';

export function mongoIdParam(nombre = 'id') {
  return param(nombre).isMongoId().withMessage('El identificador no es válido');
}

export function passwordRule(campo = 'password') {
  return body(campo)
    .isString()
    .withMessage(PASSWORD_MENSAJE)
    .isLength({ min: 8, max: 72 })
    .withMessage(PASSWORD_MENSAJE)
    .matches(/[A-Za-z]/)
    .withMessage(PASSWORD_MENSAJE)
    .matches(/\d/)
    .withMessage(PASSWORD_MENSAJE);
}

export function correoRule(campo = 'correo') {
  return body(campo)
    .trim()
    .isEmail()
    .withMessage('El correo electrónico no es válido')
    .isLength({ max: 120 })
    .toLowerCase();
}

export function urlRule(campo) {
  return body(campo)
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 500 })
    .withMessage('La URL es demasiado larga')
    .isURL({ require_protocol: true, protocols: ['http', 'https'] })
    .withMessage('Ingrese una URL válida que inicie con http:// o https://');
}

export function moneyRule(campo, { min = 0, mensaje } = {}) {
  return body(campo).custom((valor) => {
    if (!isValidMoney(valor) || Number(valor) < min || (min > 0 && Number(valor) === 0)) {
      throw new Error(mensaje || 'Ingrese un monto válido con máximo dos decimales');
    }
    return true;
  });
}
