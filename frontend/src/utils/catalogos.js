export const SEXOS = Object.freeze({
  MASCULINO: 'Masculino',
  FEMENINO: 'Femenino',
  OTRO: 'Otro'
});

export const PARENTESCOS = Object.freeze(['Madre', 'Padre', 'Tutor legal', 'Abuelo(a)', 'Tío(a)', 'Hermano(a)', 'Otro']);

export const ESTADOS_CITA = Object.freeze({
  PENDIENTE: 'Pendiente',
  CONFIRMADA: 'Confirmada',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada'
});

export const TIPOS_MATERIAL = Object.freeze({
  DOCUMENTO: 'Documento',
  VIDEO: 'Video',
  AUDIO: 'Audio',
  ENLACE: 'Enlace',
  EJERCICIO: 'Ejercicio',
  OTRO: 'Otro'
});

export const CATEGORIAS_CORPORATIVO = Object.freeze({
  CAPACITACION: 'Capacitación',
  ESCUELA_PADRES: 'Escuela para padres',
  ACTIVIDAD: 'Actividad'
});

export const METODOS_PAGO = Object.freeze({
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
  TARJETA: 'Tarjeta'
});

export const ESTADOS_PAGO = Object.freeze({
  REGISTRADO: 'Registrado',
  ANULADO: 'Anulado'
});

export const ESTADOS_FINANCIEROS = Object.freeze({
  PENDIENTE: 'Pendiente de pago',
  PARCIAL: 'Pago parcial',
  PAGADO: 'Pagado'
});
