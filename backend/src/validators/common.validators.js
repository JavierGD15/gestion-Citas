import { body, param } from 'express-validator';

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
