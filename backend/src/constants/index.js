export const ROLES = Object.freeze({
  ADMINISTRADOR: 'ADMINISTRADOR',
  RECEPCIONISTA: 'RECEPCIONISTA',
  PROFESIONAL: 'PROFESIONAL'
});

export const ESTADOS = Object.freeze({
  ACTIVO: 'ACTIVO',
  INACTIVO: 'INACTIVO'
});

export const TIPOS_CONTENIDO = Object.freeze({
  GENERAL: 'GENERAL',
  MISION: 'MISION',
  VISION: 'VISION',
  CONTACTO: 'CONTACTO',
  EDUCATIVO: 'EDUCATIVO',
  CORPORATIVO: 'CORPORATIVO'
});

export const CONTENIDO_UNICO = Object.freeze([
  TIPOS_CONTENIDO.GENERAL,
  TIPOS_CONTENIDO.MISION,
  TIPOS_CONTENIDO.VISION,
  TIPOS_CONTENIDO.CONTACTO
]);

export const CATEGORIAS_CORPORATIVO = Object.freeze({
  CAPACITACION: 'CAPACITACION',
  ESCUELA_PADRES: 'ESCUELA_PADRES',
  ACTIVIDAD: 'ACTIVIDAD'
});

export const DIAS_SEMANA = Object.freeze([
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado'
]);

export const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export const SEXOS = Object.freeze({
  MASCULINO: 'MASCULINO',
  FEMENINO: 'FEMENINO',
  OTRO: 'OTRO'
});

export const MAYORIA_EDAD = 18;

export const ESTADOS_SOLICITUD = Object.freeze({
  PENDIENTE: 'PENDIENTE',
  ATENDIDA: 'ATENDIDA',
  RECHAZADA: 'RECHAZADA'
});
