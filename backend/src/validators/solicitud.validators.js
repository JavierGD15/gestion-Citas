import { body, query } from 'express-validator';
import { ESTADOS_SOLICITUD } from '../constants/index.js';
import { busquedaRules, correoRule, mongoIdParam } from './common.validators.js';
import { TELEFONO_REGEX } from './contacto.validators.js';
import { esFechaValida, hoyISO } from '../utils/fechas.js';

export const crearSolicitudRules = [
  body('nombreSolicitante').trim().isLength({ min: 3, max: 120 }).withMessage('El nombre debe tener entre 3 y 120 caracteres'),
  correoRule(),
  body('telefono').trim().matches(TELEFONO_REGEX).withMessage('Ingrese un teléfono válido de al menos 8 dígitos'),
  body('servicio').isMongoId().withMessage('Seleccione un servicio válido'),
  body('fechaPreferida').custom((valor) => {
    if (!esFechaValida(valor)) {
      throw new Error('Ingrese una fecha válida con formato AAAA-MM-DD');
    }
    if (valor < hoyISO()) {
      throw new Error('La fecha preferida no puede ser una fecha pasada');
    }
    return true;
  }),
  body('mensaje').optional().isString().trim().isLength({ max: 1000 }).withMessage('El mensaje no debe superar 1000 caracteres')
];

export const listarSolicitudesRules = [
  ...busquedaRules(),
  query('estado').optional().isIn(Object.values(ESTADOS_SOLICITUD)).withMessage('Estado no válido')
];

export const rechazarSolicitudRules = [
  mongoIdParam(),
  body('motivo').trim().isLength({ min: 5, max: 500 }).withMessage('Indique un motivo de entre 5 y 500 caracteres')
];
