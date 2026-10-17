import { body, query } from 'express-validator';
import { busquedaRules, correoRule, mongoIdParam, urlRule } from './common.validators.js';
import { TELEFONO_REGEX } from './contacto.validators.js';

const reglasBase = () => [
  urlRule('fotografia'),
  body('nombres').trim().isLength({ min: 2, max: 80 }).withMessage('Los nombres deben tener entre 2 y 80 caracteres'),
  body('apellidos').trim().isLength({ min: 2, max: 80 }).withMessage('Los apellidos deben tener entre 2 y 80 caracteres'),
  body('parentesco').trim().isLength({ min: 2, max: 50 }).withMessage('El parentesco debe tener entre 2 y 50 caracteres'),
  body('telefono').trim().matches(TELEFONO_REGEX).withMessage('Ingrese un teléfono válido de al menos 8 dígitos'),
  correoRule(),
  body('direccion').trim().isLength({ min: 3, max: 250 }).withMessage('La dirección debe tener entre 3 y 250 caracteres')
];

const pacientesRule = () =>
  body('pacientes')
    .optional()
    .isArray({ max: 20 })
    .withMessage('La lista de pacientes no es válida')
    .custom((ids) => ids.every((id) => /^[a-f\d]{24}$/i.test(id)))
    .withMessage('Algún identificador de paciente no es válido');

export const listarResponsablesRules = [
  ...busquedaRules(),
  query('paciente').optional().isMongoId().withMessage('Paciente no válido')
];

export const crearResponsableRules = [...reglasBase(), pacientesRule()];

export const actualizarResponsableRules = [mongoIdParam(), ...reglasBase().map((regla) => regla.optional())];

export const asociarPacienteRules = [mongoIdParam(), body('paciente').isMongoId().withMessage('Paciente no válido')];

export const desasociarPacienteRules = [mongoIdParam(), mongoIdParam('pacienteId')];
