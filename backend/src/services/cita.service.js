import Cita from '../models/Cita.js';
import Contador from '../models/Contador.js';
import Horario from '../models/Horario.js';
import Paciente from '../models/Paciente.js';
import Profesional from '../models/Profesional.js';
import Servicio from '../models/Servicio.js';
import ApiError from '../utils/ApiError.js';
import { combinarFechaHora, diaSemana, sumarMinutos } from '../utils/fechas.js';
import { buildMeta, getPagination } from '../utils/pagination.js';
import { obtenerActivo as obtenerProfesionalActivo, obtenerPorUsuario } from './profesional.service.js';
import { tieneResponsable } from './responsable.service.js';
import { adjuntarResumen, resumenCita } from './finanzas.service.js';
import Pago from '../models/Pago.js';
import { DIAS_SEMANA, ESTADOS, ESTADOS_CITA, ESTADOS_CITA_ACTIVOS, ESTADOS_PAGO, ROLES, TRANSICIONES_CITA } from '../constants/index.js';

export const POPULATE_CITA = [
  { path: 'paciente', select: 'codigo nombres apellidos fotografia fechaNacimiento telefono estado' },
  { path: 'servicio', select: 'nombre duracionMinutos precioCentavos estado' },
  { path: 'profesional', select: 'especialidad usuario fotografia estado', populate: { path: 'usuario', select: 'nombres apellidos' } },
  { path: 'creadoPor', select: 'nombres apellidos' },
  { path: 'historial.usuario', select: 'nombres apellidos' }
];

async function profesionalDelUsuario(usuario) {
  if (usuario.rol !== ROLES.PROFESIONAL) {
    return null;
  }
  const profesional = await obtenerPorUsuario(usuario._id);
  if (!profesional) {
    throw new ApiError(403, 'El usuario no tiene un perfil profesional asignado');
  }
  return profesional;
}

async function validarHorarioAtencion(fecha, horaInicio, horaFin) {
  const horario = await Horario.findOne({ diaSemana: diaSemana(fecha) });
  if (!horario || !horario.activo) {
    throw new ApiError(422, `No hay atención los días ${DIAS_SEMANA[diaSemana(fecha)].toLowerCase()}`);
  }
  if (horaInicio < horario.horaInicio || horaFin > horario.horaFin) {
    throw new ApiError(
      422,
      `La cita debe estar dentro del horario de atención (${horario.horaInicio} a ${horario.horaFin}). La cita terminaría a las ${horaFin}`
    );
  }
}

async function validarTraslapes({ profesional, paciente, inicio, fin, excluirId }) {
  const base = { estado: { $in: ESTADOS_CITA_ACTIVOS }, inicio: { $lt: fin }, fin: { $gt: inicio } };
  if (excluirId) {
    base._id = { $ne: excluirId };
  }

  const conflictoProfesional = await Cita.findOne({ ...base, profesional });
  if (conflictoProfesional) {
    throw new ApiError(
      409,
      `El profesional ya tiene una cita de ${conflictoProfesional.horaInicio} a ${conflictoProfesional.horaFin} en esa fecha`
    );
  }

  const conflictoPaciente = await Cita.findOne({ ...base, paciente });
  if (conflictoPaciente) {
    throw new ApiError(
      409,
      `El paciente ya tiene una cita de ${conflictoPaciente.horaInicio} a ${conflictoPaciente.horaFin} en esa fecha`
    );
  }
}

async function calcularHorario({ fecha, horaInicio, duracionMinutos, profesional, paciente, excluirId }) {
  const horaFin = sumarMinutos(horaInicio, duracionMinutos);
  if (horaFin <= horaInicio || horaFin > '23:59') {
    throw new ApiError(422, 'La cita no puede extenderse al día siguiente');
  }

  const inicio = combinarFechaHora(fecha, horaInicio);
  const fin = new Date(inicio.getTime() + duracionMinutos * 60000);

  if (inicio <= new Date()) {
    throw new ApiError(422, 'No se pueden programar citas en fechas u horas pasadas');
  }

  await validarHorarioAtencion(fecha, horaInicio, horaFin);
  await validarTraslapes({ profesional, paciente, inicio, fin, excluirId });

  return { fecha, horaInicio, horaFin, inicio, fin };
}

async function validarPacienteParaCita(pacienteId) {
  const paciente = await Paciente.findById(pacienteId);
  if (!paciente) {
    throw new ApiError(404, 'Paciente no encontrado');
  }
  if (paciente.estado !== ESTADOS.ACTIVO) {
    throw new ApiError(422, 'El paciente está inactivo y no puede recibir nuevas citas');
  }
  if (paciente.esMenor && !(await tieneResponsable(paciente._id))) {
    throw new ApiError(422, 'El paciente es menor de edad y debe tener al menos un responsable registrado antes de programar citas');
  }
  return paciente;
}

export async function crear(datos, usuario, opciones = {}) {
  const paciente = await validarPacienteParaCita(datos.paciente);

  const servicio = await Servicio.findById(datos.servicio);
  if (!servicio) {
    throw new ApiError(404, 'Servicio no encontrado');
  }
  if (servicio.estado !== ESTADOS.ACTIVO) {
    throw new ApiError(422, 'El servicio está inactivo y no puede utilizarse para nuevas citas');
  }

  const profesional = await obtenerProfesionalActivo(datos.profesional);

  const horario = await calcularHorario({
    fecha: datos.fecha,
    horaInicio: datos.horaInicio,
    duracionMinutos: servicio.duracionMinutos,
    profesional: profesional._id,
    paciente: paciente._id
  });

  const secuencia = await Contador.siguiente('cita');
  const cita = await Cita.create({
    codigo: `CIT-${String(secuencia).padStart(6, '0')}`,
    paciente: paciente._id,
    servicio: servicio._id,
    profesional: profesional._id,
    ...horario,
    duracionMinutos: servicio.duracionMinutos,
    precioCentavos: servicio.precioCentavos,
    observaciones: datos.observaciones || '',
    solicitud: opciones.solicitud || null,
    creadoPor: usuario._id,
    historial: [
      {
        accion: 'PROGRAMADA',
        estado: ESTADOS_CITA.PENDIENTE,
        detalle: `${horario.fecha} ${horario.horaInicio}`,
        usuario: usuario._id
      }
    ]
  });

  return obtener(cita._id, usuario);
}

export async function construirFiltro(query, usuario) {
  const filtro = {};
  const profesionalPropio = await profesionalDelUsuario(usuario);

  if (profesionalPropio) {
    filtro.profesional = profesionalPropio._id;
  } else if (query.profesional) {
    filtro.profesional = query.profesional;
  }
  if (query.paciente) {
    filtro.paciente = query.paciente;
  }
  if (query.servicio) {
    filtro.servicio = query.servicio;
  }
  if (query.estado) {
    filtro.estado = query.estado;
  }
  if (query.fecha) {
    filtro.fecha = query.fecha;
  } else if (query.desde || query.hasta) {
    filtro.fecha = {};
    if (query.desde) {
      filtro.fecha.$gte = query.desde;
    }
    if (query.hasta) {
      filtro.fecha.$lte = query.hasta;
    }
  }
  return filtro;
}

export async function listar(query, usuario) {
  const filtro = await construirFiltro(query, usuario);
  const paginacion = getPagination(query);
  const orden = query.orden === 'asc' ? 1 : -1;
  const [data, total] = await Promise.all([
    Cita.find(filtro)
      .select('-historial')
      .populate(POPULATE_CITA.slice(0, 3))
      .sort({ inicio: orden })
      .skip(paginacion.skip)
      .limit(paginacion.limit),
    Cita.countDocuments(filtro)
  ]);
  return { data: await adjuntarResumen(data), meta: buildMeta(paginacion, total) };
}

export async function calendario(query, usuario) {
  const [anio, mes] = query.mes.split('-').map(Number);
  const desde = `${query.mes}-01`;
  const ultimoDia = new Date(Date.UTC(anio, mes, 0)).getUTCDate();
  const hasta = `${query.mes}-${String(ultimoDia).padStart(2, '0')}`;
  const filtro = await construirFiltro({ ...query, desde, hasta, fecha: undefined }, usuario);
  return Cita.find(filtro).select('-historial').populate(POPULATE_CITA.slice(0, 3)).sort({ inicio: 1 }).limit(2000);
}

export async function obtener(id, usuario) {
  const cita = await Cita.findById(id).populate(POPULATE_CITA);
  if (!cita) {
    throw new ApiError(404, 'Cita no encontrada');
  }
  const profesionalPropio = await profesionalDelUsuario(usuario);
  if (profesionalPropio && !cita.profesional._id.equals(profesionalPropio._id)) {
    throw new ApiError(403, 'Solo puede consultar sus citas asignadas');
  }
  return { ...cita.toJSON(), finanzas: await resumenCita(cita) };
}

export async function actualizar(id, datos, usuario) {
  const cita = await Cita.findById(id);
  if (!cita) {
    throw new ApiError(404, 'Cita no encontrada');
  }

  const reprogramar = ['fecha', 'horaInicio', 'profesional'].some(
    (campo) => datos[campo] !== undefined && String(datos[campo]) !== String(cita[campo])
  );

  if (reprogramar) {
    if (cita.estado === ESTADOS_CITA.COMPLETADA) {
      throw new ApiError(422, 'Las citas completadas no pueden reprogramarse');
    }
    if (cita.estado === ESTADOS_CITA.CANCELADA) {
      throw new ApiError(422, 'Las citas canceladas no pueden reprogramarse');
    }

    await validarPacienteParaCita(cita.paciente);
    const profesionalId = datos.profesional || cita.profesional;
    const profesional = await obtenerProfesionalActivo(profesionalId);
    const anterior = `${cita.fecha} ${cita.horaInicio}`;

    const horario = await calcularHorario({
      fecha: datos.fecha || cita.fecha,
      horaInicio: datos.horaInicio || cita.horaInicio,
      duracionMinutos: cita.duracionMinutos,
      profesional: profesional._id,
      paciente: cita.paciente,
      excluirId: cita._id
    });

    cita.set({ ...horario, profesional: profesional._id, estado: ESTADOS_CITA.PENDIENTE });
    cita.historial.push({
      accion: 'REPROGRAMADA',
      estado: ESTADOS_CITA.PENDIENTE,
      detalle: `De ${anterior} a ${horario.fecha} ${horario.horaInicio}`,
      usuario: usuario._id
    });
  }

  if (datos.observaciones !== undefined) {
    cita.observaciones = datos.observaciones;
  }

  await cita.save();
  return obtener(cita._id, usuario);
}

export async function cambiarEstado(id, { estado, motivo }, usuario) {
  const cita = await Cita.findById(id);
  if (!cita) {
    throw new ApiError(404, 'Cita no encontrada');
  }

  if (usuario.rol === ROLES.PROFESIONAL) {
    const profesional = await profesionalDelUsuario(usuario);
    if (!cita.profesional.equals(profesional._id)) {
      throw new ApiError(403, 'Solo puede modificar sus citas asignadas');
    }
    if (estado !== ESTADOS_CITA.COMPLETADA) {
      throw new ApiError(403, 'El profesional solo puede marcar citas como completadas');
    }
  }

  if (cita.estado === estado) {
    throw new ApiError(422, `La cita ya se encuentra en estado ${estado}`);
  }

  if (cita.estado === ESTADOS_CITA.CANCELADA && estado === ESTADOS_CITA.COMPLETADA) {
    throw new ApiError(422, 'Una cita cancelada no puede marcarse como completada');
  }

  if (!TRANSICIONES_CITA[cita.estado].includes(estado)) {
    throw new ApiError(422, `No es posible cambiar una cita de ${cita.estado} a ${estado}`);
  }

  if (estado === ESTADOS_CITA.CANCELADA && (await Pago.exists({ cita: cita._id, estado: ESTADOS_PAGO.REGISTRADO }))) {
    throw new ApiError(422, 'La cita tiene pagos válidos. Primero deben anularse sus pagos mientras la caja correspondiente permanezca abierta');
  }

  const cambios = {
    estado,
    $push: { historial: { accion: 'CAMBIO_ESTADO', estado, detalle: motivo || '', usuario: usuario._id, fecha: new Date() } }
  };
  if (estado === ESTADOS_CITA.CANCELADA) {
    cambios.motivoCancelacion = motivo;
  }

  const actualizada = await Cita.findOneAndUpdate({ _id: cita._id, estado: cita.estado }, cambios, { new: true });
  if (!actualizada) {
    throw new ApiError(409, 'La cita fue modificada por otro usuario. Actualice e intente de nuevo');
  }

  return obtener(cita._id, usuario);
}

export async function historialPaciente(pacienteId, usuario) {
  const filtro = { paciente: pacienteId };
  const profesionalPropio = await profesionalDelUsuario(usuario);
  if (profesionalPropio) {
    filtro.profesional = profesionalPropio._id;
  }
  const citas = await Cita.find(filtro).select('-historial').populate(POPULATE_CITA.slice(1, 3)).sort({ inicio: -1 });
  return adjuntarResumen(citas);
}

export async function pacientesDelProfesional(usuario) {
  const profesional = await profesionalDelUsuario(usuario);
  return Cita.distinct('paciente', { profesional: profesional._id });
}

export async function disponibilidad({ profesional, fecha, servicio, excluir }) {
  const [servicioDoc, horario] = await Promise.all([Servicio.findById(servicio), Horario.findOne({ diaSemana: diaSemana(fecha) })]);
  if (!servicioDoc) {
    throw new ApiError(404, 'Servicio no encontrado');
  }
  if (!(await Profesional.exists({ _id: profesional }))) {
    throw new ApiError(404, 'Profesional no encontrado');
  }

  const filtro = { profesional, fecha, estado: { $in: ESTADOS_CITA_ACTIVOS } };
  if (excluir) {
    filtro._id = { $ne: excluir };
  }
  const ocupadas = await Cita.find(filtro).select('horaInicio horaFin').sort({ horaInicio: 1 });

  if (!horario || !horario.activo) {
    return { horario: null, ocupadas, disponibles: [] };
  }

  const ahora = new Date();
  const disponibles = [];
  for (let hora = horario.horaInicio; hora < horario.horaFin; hora = sumarMinutos(hora, 30)) {
    const horaFin = sumarMinutos(hora, servicioDoc.duracionMinutos);
    const libre = horaFin <= horario.horaFin && ocupadas.every((cita) => horaFin <= cita.horaInicio || hora >= cita.horaFin);
    if (libre && combinarFechaHora(fecha, hora) > ahora) {
      disponibles.push(hora);
    }
  }

  return { horario, ocupadas, disponibles, duracionMinutos: servicioDoc.duracionMinutos };
}
