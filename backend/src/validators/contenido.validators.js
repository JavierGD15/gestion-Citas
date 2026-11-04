import { body, query } from 'express-validator';
import { ESTADOS, HORA_REGEX, TIPOS_CONTENIDO } from '../constants/index.js';
import { mongoIdParam } from './common.validators.js';
import { esFechaValida } from '../utils/fechas.js';

const camposComunes = () => [
  body('titulo').optional().isString().isLength({ max: 200 }).withMessage('El título no debe superar 200 caracteres'),
  body('descripcion').optional().isString().isLength({ max: 5000 }).withMessage('La descripción no debe superar 5000 caracteres'),
  body('imagen').optional().isString(),
  body('imagenes').optional().isArray({ max: 12 }).withMessage('Máximo 12 imágenes'),
  body('enlace').optional().isString(),
  body('orden').optional().isInt({ min: 0, max: 999 }).withMessage('El orden debe ser un número entre 0 y 999'),
  body('datos').optional().isObject().withMessage('Los datos no son válidos'),
  body('fechaPublicacion')
    .optional({ values: 'falsy' })
    .custom((valor) => esFechaValida(valor))
    .withMessage('Ingrese una fecha válida con formato AAAA-MM-DD')
];

export const listarContenidoAdminRules = [query('tipo').optional().isIn(Object.values(TIPOS_CONTENIDO)).withMessage('Tipo no válido')];

export const crearContenidoRules = [
  body('tipo').isIn([TIPOS_CONTENIDO.EDUCATIVO, TIPOS_CONTENIDO.CORPORATIVO]).withMessage('Tipo no válido'),
  body('titulo').trim().isLength({ min: 3, max: 200 }).withMessage('El título debe tener entre 3 y 200 caracteres'),
  ...camposComunes()
];

export const actualizarContenidoRules = [mongoIdParam(), ...camposComunes()];

export const estadoContenidoRules = [mongoIdParam(), body('estado').isIn(Object.values(ESTADOS)).withMessage('Estado no válido')];

export const actualizarHorariosRules = [
  body('horarios').isArray({ min: 1, max: 7 }).withMessage('Envíe la configuración de los días de atención'),
  body('horarios.*.diaSemana').isInt({ min: 0, max: 6 }).withMessage('Día no válido').toInt(),
  body('horarios.*.activo').isBoolean().withMessage('Indique si el día está activo').toBoolean(),
  body('horarios.*.horaInicio').matches(HORA_REGEX).withMessage('Hora de inicio no válida'),
  body('horarios.*.horaFin').matches(HORA_REGEX).withMessage('Hora de fin no válida')
];
