import MensajeContacto from '../models/MensajeContacto.js';
import ApiError from '../utils/ApiError.js';
import { buildMeta, getPagination } from '../utils/pagination.js';

export async function crear(datos) {
  const { nombre, correo, telefono, asunto, mensaje } = datos;
  return MensajeContacto.create({ nombre, correo, telefono, asunto, mensaje });
}

export async function listar(query) {
  const filtro = {};
  if (query.leido === 'true' || query.leido === 'false') {
    filtro.leido = query.leido === 'true';
  }
  const paginacion = getPagination(query);
  const [data, total] = await Promise.all([
    MensajeContacto.find(filtro)
      .populate('leidoPor', 'nombres apellidos')
      .sort({ createdAt: -1 })
      .skip(paginacion.skip)
      .limit(paginacion.limit),
    MensajeContacto.countDocuments(filtro)
  ]);
  return { data, meta: buildMeta(paginacion, total) };
}

export async function marcarLeido(id, usuario) {
  const mensaje = await MensajeContacto.findById(id);
  if (!mensaje) {
    throw new ApiError(404, 'Mensaje no encontrado');
  }
  if (!mensaje.leido) {
    mensaje.leido = true;
    mensaje.leidoPor = usuario._id;
    mensaje.fechaLectura = new Date();
    await mensaje.save();
  }
  return mensaje;
}
