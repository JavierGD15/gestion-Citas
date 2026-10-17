import { body, query } from 'express-validator';
import { ESTADOS, TIPOS_MATERIAL } from '../constants/index.js';
import { busquedaRules, mongoIdParam } from './common.validators.js';

const enlaceRule = () =>
  body('enlace')
    .trim()
    .isLength({ max: 500 })
    .withMessage('El enlace es demasiado largo')
    .isURL({ require_protocol: true, protocols: ['http', 'https'] })
    .withMessage('Ingrese un enlace válido que inicie con http:// o https://');

const reglasBase = () => [
  body('titulo').trim().isLength({ min: 3, max: 150 }).withMessage('El título debe tener entre 3 y 150 caracteres'),
  body('descripcion').trim().isLength({ min: 5, max: 2000 }).withMessage('La descripción debe tener entre 5 y 2000 caracteres'),
  body('tipo').isIn(Object.values(TIPOS_MATERIAL)).withMessage('Tipo de material no válido'),
  enlaceRule()
];

export const listarMaterialesRules = [
  ...busquedaRules(),
  query('tipo').optional().isIn(Object.values(TIPOS_MATERIAL)).withMessage('Tipo no válido'),
  query('estado').optional().isIn(Object.values(ESTADOS)).withMessage('Estado no válido')
];

export const crearMaterialRules = reglasBase();

export const actualizarMaterialRules = [mongoIdParam(), ...reglasBase().map((regla) => regla.optional())];

export const estadoMaterialRules = [mongoIdParam(), body('estado').isIn(Object.values(ESTADOS)).withMessage('Estado no válido')];

export const asignarMaterialRules = [
  mongoIdParam(),
  body('paciente').isMongoId().withMessage('Seleccione un paciente válido'),
  body('indicaciones').optional().isString().trim().isLength({ max: 1000 }).withMessage('Las indicaciones no deben superar 1000 caracteres')
];

export const retirarAsignacionRules = [mongoIdParam('asignacionId')];
