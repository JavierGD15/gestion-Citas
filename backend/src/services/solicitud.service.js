import SolicitudCita from '../models/SolicitudCita.js';
import Servicio from '../models/Servicio.js';
import ApiError from '../utils/ApiError.js';
import { fechaSoloDia } from '../utils/fechas.js';
import { buildMeta, getPagination, searchRegex } from '../utils/pagination.js';
import { ESTADOS, ESTADOS_SOLICITUD } from '../constants/index.js';

const POPULATE = [
  { path: 'servicio', select: 'nombre duracionMinutos precioCentavos estado' },
  { path: 'atendidaPor', select: 'nombres apellidos' }
];

export async function crear(datos) {
  const servicio = await Servicio.findById(datos.servicio);
  if (!servicio || servicio.estado !== ESTADOS.ACTIVO) {
    throw new ApiError(422, 'El servicio seleccionado no está disponible');
  }
  return SolicitudCita.create({
    nombreSolicitante: datos.nombreSolicitante,
    correo: datos.correo,
    telefono: datos.telefono,
    servicio: servicio._id,
    fechaPreferida: fechaSoloDia(datos.fechaPreferida),
    mensaje: datos.mensaje || ''
  });
}

export async function listar(query) {
  const filtro = {};
  if (query.estado) {
    filtro.estado = query.estado;
  }
  if (query.q) {
    const regex = searchRegex(query.q);
    filtro.$or = [{ nombreSolicitante: regex }, { correo: regex }, { telefono: regex }];
  }
  const paginacion = getPagination(query);
  const [data, total] = await Promise.all([
    SolicitudCita.find(filtro).populate(POPULATE).sort({ createdAt: -1 }).skip(paginacion.skip).limit(paginacion.limit),
    SolicitudCita.countDocuments(filtro)
  ]);
  return { data, meta: buildMeta(paginacion, total) };
}

export async function obtener(id) {
  const solicitud = await SolicitudCita.findById(id).populate(POPULATE);
  if (!solicitud) {
    throw new ApiError(404, 'Solicitud no encontrada');
  }
  return solicitud;
}

export async function rechazar(id, motivo, usuario) {
  const solicitud = await SolicitudCita.findOneAndUpdate(
    { _id: id, estado: ESTADOS_SOLICITUD.PENDIENTE },
    { estado: ESTADOS_SOLICITUD.RECHAZADA, motivoRechazo: motivo, atendidaPor: usuario._id, fechaAtencion: new Date() },
    { new: true }
  );
  if (!solicitud) {
    await obtener(id);
    throw new ApiError(409, 'Solo pueden rechazarse solicitudes pendientes');
  }
  return obtener(id);
}

export async function contarPendientes() {
  return SolicitudCita.countDocuments({ estado: ESTADOS_SOLICITUD.PENDIENTE });
}
