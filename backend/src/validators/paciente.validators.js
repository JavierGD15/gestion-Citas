import { body, query } from 'express-validator';
import { ESTADOS, SEXOS } from '../constants/index.js';
import { busquedaRules, fechaRule, mongoIdParam, urlRule } from './common.validators.js';
import { TELEFONO_REGEX } from './contacto.validators.js';

const reglasBase = () => [
  urlRule('fotografia'),
  body('nombres').trim().isLength({ min: 2, max: 80 }).withMessage('Los nombres deben tener entre 2 y 80 caracteres'),
  body('apellidos').trim().isLength({ min: 2, max: 80 }).withMessage('Los apellidos deben tener entre 2 y 80 caracteres'),
  fechaRule('fechaNacimiento', { pasadaOHoy: true }),
  body('sexo').isIn(Object.values(SEXOS)).withMessage('Sexo no válido'),
  body('telefono').trim().matches(TELEFONO_REGEX).withMessage('Ingrese un teléfono válido de al menos 8 dígitos'),
  body('direccion').trim().isLength({ min: 3, max: 250 }).withMessage('La dirección debe tener entre 3 y 250 caracteres'),
  fechaRule('fechaInicioProceso'),
  body('observaciones').optional().isString().trim().isLength({ max: 2000 }).withMessage('Las observaciones no deben superar 2000 caracteres')
];

const opcional = (reglas) => reglas.map((regla) => regla.optional());

export const listarPacientesRules = [
  ...busquedaRules(),
  query('estado').optional().isIn(Object.values(ESTADOS)).withMessage('Estado no válido')
];

export const crearPacienteRules = reglasBase();

export const actualizarPacienteRules = [mongoIdParam(), ...opcional(reglasBase())];

export const estadoPacienteRules = [mongoIdParam(), body('estado').isIn(Object.values(ESTADOS)).withMessage('Estado no válido')];
