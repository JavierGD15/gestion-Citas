import { body, query } from 'express-validator';
import { ESTADOS } from '../constants/index.js';
import { moneyRule, mongoIdParam, urlRule } from './common.validators.js';

const nombre = () => body('nombre').trim().isLength({ min: 3, max: 120 }).withMessage('El nombre debe tener entre 3 y 120 caracteres');
const descripcion = () =>
  body('descripcion').trim().isLength({ min: 10, max: 2000 }).withMessage('La descripción debe tener entre 10 y 2000 caracteres');
const duracion = () =>
  body('duracionMinutos').isInt({ min: 5, max: 480 }).withMessage('La duración debe ser un número entero entre 5 y 480 minutos').toInt();
const precio = () => moneyRule('precio', { mensaje: 'El precio debe ser un monto válido en quetzales con máximo dos decimales' });

export const listarServiciosRules = [
  query('estado').optional().isIn(Object.values(ESTADOS)).withMessage('Estado no válido'),
  query('q').optional().isString().trim().isLength({ max: 80 })
];

export const crearServicioRules = [nombre(), descripcion(), duracion(), precio(), urlRule('imagen')];

export const actualizarServicioRules = [
  mongoIdParam(),
  nombre().optional(),
  descripcion().optional(),
  duracion().optional(),
  precio().optional(),
  urlRule('imagen')
];

export const estadoServicioRules = [mongoIdParam(), body('estado').isIn(Object.values(ESTADOS)).withMessage('Estado no válido')];
