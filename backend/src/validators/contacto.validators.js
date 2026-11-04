import { body, query } from 'express-validator';
import { correoRule } from './common.validators.js';

export const TELEFONO_REGEX = /^[0-9+\-\s]{8,20}$/;

export const crearMensajeRules = [
  body('nombre').trim().isLength({ min: 3, max: 120 }).withMessage('El nombre debe tener entre 3 y 120 caracteres'),
  correoRule(),
  body('telefono').trim().matches(TELEFONO_REGEX).withMessage('Ingrese un teléfono válido de al menos 8 dígitos'),
  body('asunto').trim().isLength({ min: 3, max: 150 }).withMessage('El asunto debe tener entre 3 y 150 caracteres'),
  body('mensaje').trim().isLength({ min: 10, max: 2000 }).withMessage('El mensaje debe tener entre 10 y 2000 caracteres')
];

export const listarMensajesRules = [query('leido').optional().isIn(['true', 'false']).withMessage('Filtro no válido')];
