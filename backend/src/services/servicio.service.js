import Servicio from '../models/Servicio.js';
import ApiError from '../utils/ApiError.js';
import { toCents } from '../utils/money.js';
import { searchRegex } from '../utils/pagination.js';
import { ESTADOS } from '../constants/index.js';

function mapearDatos(datos) {
  const cambios = {};
  ['nombre', 'descripcion', 'duracionMinutos', 'imagen'].forEach((campo) => {
    if (datos[campo] !== undefined) {
      cambios[campo] = datos[campo];
    }
  });
  if (datos.precio !== undefined) {
    cambios.precioCentavos = toCents(datos.precio);
  }
  return cambios;
}

export async function listar(query, usuario) {
  const filtro = {};
  if (!usuario) {
    filtro.estado = ESTADOS.ACTIVO;
  } else if (query.estado) {
    filtro.estado = query.estado;
  }
  if (query.q) {
    filtro.nombre = searchRegex(query.q);
  }
  return Servicio.find(filtro).sort({ nombre: 1 });
}

export async function obtener(id, usuario) {
  const servicio = await Servicio.findById(id);
  if (!servicio || (!usuario && servicio.estado !== ESTADOS.ACTIVO)) {
    throw new ApiError(404, 'Servicio no encontrado');
  }
  return servicio;
}

export async function crear(datos) {
  return Servicio.create(mapearDatos(datos));
}

export async function actualizar(id, datos) {
  const servicio = await obtener(id, true);
  servicio.set(mapearDatos(datos));
  await servicio.save();
  return servicio;
}

export async function cambiarEstado(id, estado) {
  const servicio = await obtener(id, true);
  servicio.estado = estado;
  await servicio.save();
  return servicio;
}
