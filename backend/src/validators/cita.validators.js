import { body, query } from 'express-validator';
import { ESTADOS_CITA, HORA_REGEX } from '../constants/index.js';
import { fechaRule, mongoIdParam } from './common.validators.js';
import { esFechaValida } from '../utils/fechas.js';

const fechaQuery = (campo) =>
  query(campo)
    .optional()
    .custom((valor) => esFechaValida(valor))
    .withMessage('Ingrese una fecha válida con formato AAAA-MM-DD');

const horaRule = () => body('horaInicio').matches(HORA_REGEX).withMessage('Ingrese una hora válida con formato HH:mm');

const observacionesRule = () =>
  body('observaciones').optional().isString().trim().isLength({ max: 2000 }).withMessage('Las observaciones no deben superar 2000 caracteres');

export const listarCitasRules = [
  query('profesional').optional().isMongoId().withMessage('Profesional no válido'),
  query('paciente').optional().isMongoId().withMessage('Paciente no válido'),
  query('servicio').optional().isMongoId().withMessage('Servicio no válido'),
  query('estado').optional().isIn(Object.values(ESTADOS_CITA)).withMessage('Estado no válido'),
  fechaQuery('fecha'),
  fechaQuery('desde'),
  fechaQuery('hasta'),
  query('orden').optional().isIn(['asc', 'desc']).withMessage('Orden no válido'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
];

export const calendarioRules = [
  query('mes').matches(/^\d{4}-(0[1-9]|1[0-2])$/).withMessage('Indique el mes con formato AAAA-MM'),
  query('profesional').optional().isMongoId().withMessage('Profesional no válido'),
  query('estado').optional().isIn(Object.values(ESTADOS_CITA)).withMessage('Estado no válido')
];

export const disponibilidadRules = [
  query('profesional').isMongoId().withMessage('Profesional no válido'),
  query('servicio').isMongoId().withMessage('Servicio no válido'),
  query('fecha').custom((valor) => esFechaValida(valor)).withMessage('Ingrese una fecha válida con formato AAAA-MM-DD'),
  query('excluir').optional().isMongoId()
];

export const crearCitaRules = [
  body('paciente').isMongoId().withMessage('Seleccione un paciente válido'),
  body('servicio').isMongoId().withMessage('Seleccione un servicio válido'),
  body('profesional').isMongoId().withMessage('Seleccione un profesional válido'),
  fechaRule('fecha'),
  horaRule(),
  observacionesRule()
];

export const actualizarCitaRules = [
  mongoIdParam(),
  body('profesional').optional().isMongoId().withMessage('Seleccione un profesional válido'),
  fechaRule('fecha').optional(),
  horaRule().optional(),
  observacionesRule()
];

export const estadoCitaRules = [
  mongoIdParam(),
  body('estado').isIn(Object.values(ESTADOS_CITA)).withMessage('Estado no válido'),
  body('motivo')
    .if(body('estado').equals(ESTADOS_CITA.CANCELADA))
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Indique el motivo de la cancelación (mínimo 5 caracteres)'),
  body('motivo').optional().isString().trim().isLength({ max: 500 })
];

export const convertirSolicitudRules = [
  mongoIdParam(),
  body('paciente').isMongoId().withMessage('Seleccione un paciente válido'),
  body('servicio').optional().isMongoId().withMessage('Seleccione un servicio válido'),
  body('profesional').isMongoId().withMessage('Seleccione un profesional válido'),
  fechaRule('fecha'),
  horaRule(),
  observacionesRule()
];
