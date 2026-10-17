import { body, query } from 'express-validator';
import { ESTADOS } from '../constants/index.js';
import { busquedaRules, correoRule, mongoIdParam, passwordRule, urlRule } from './common.validators.js';
import { TELEFONO_REGEX } from './contacto.validators.js';

const perfilRules = () => [
  body('especialidad').trim().isLength({ min: 3, max: 120 }).withMessage('La especialidad debe tener entre 3 y 120 caracteres'),
  body('colegiado').optional().isString().trim().isLength({ max: 30 }).withMessage('El número de colegiado no debe superar 30 caracteres'),
  body('telefono').trim().matches(TELEFONO_REGEX).withMessage('Ingrese un teléfono válido de al menos 8 dígitos'),
  body('descripcion').optional().isString().trim().isLength({ max: 1000 }).withMessage('La descripción no debe superar 1000 caracteres'),
  urlRule('fotografia')
];

const usuarioRules = () => [
  body('nombres').trim().isLength({ min: 2, max: 80 }).withMessage('Los nombres deben tener entre 2 y 80 caracteres'),
  body('apellidos').trim().isLength({ min: 2, max: 80 }).withMessage('Los apellidos deben tener entre 2 y 80 caracteres'),
  correoRule()
];

export const listarProfesionalesRules = [
  ...busquedaRules(),
  query('estado').optional().isIn(Object.values(ESTADOS)).withMessage('Estado no válido')
];

export const crearProfesionalRules = [
  body('usuarioId').optional().isMongoId().withMessage('Usuario no válido'),
  ...usuarioRules().map((regla) => regla.if(body('usuarioId').not().exists())),
  passwordRule().if(body('usuarioId').not().exists()),
  ...perfilRules()
];

export const actualizarProfesionalRules = [mongoIdParam(), ...usuarioRules().map((r) => r.optional()), ...perfilRules().map((r) => r.optional())];

export const estadoProfesionalRules = [mongoIdParam(), body('estado').isIn(Object.values(ESTADOS)).withMessage('Estado no válido')];
