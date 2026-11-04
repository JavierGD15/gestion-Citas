import Paciente from '../models/Paciente.js';
import Contador from '../models/Contador.js';
import ApiError from '../utils/ApiError.js';
import { fechaSoloDia } from '../utils/fechas.js';
import { buildMeta, getPagination, searchRegex } from '../utils/pagination.js';

const CAMPOS = ['fotografia', 'nombres', 'apellidos', 'sexo', 'telefono', 'direccion', 'observaciones'];
const CAMPOS_FECHA = ['fechaNacimiento', 'fechaInicioProceso'];

function mapearDatos(datos) {
  const cambios = {};
  CAMPOS.forEach((campo) => {
    if (datos[campo] !== undefined) {
      cambios[campo] = datos[campo];
    }
  });
  CAMPOS_FECHA.forEach((campo) => {
    if (datos[campo] !== undefined) {
      cambios[campo] = fechaSoloDia(datos[campo]);
    }
  });
  return cambios;
}

export function filtroBusqueda(texto) {
  const terminos = String(texto || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 5);
  if (terminos.length === 0) {
    return {};
  }
  return {
    $and: terminos.map((termino) => {
      const regex = searchRegex(termino);
      return { $or: [{ nombres: regex }, { apellidos: regex }, { codigo: regex }, { telefono: regex }] };
    })
  };
}

export async function listar(query, filtroExtra = {}) {
  const filtro = { ...filtroBusqueda(query.q), ...filtroExtra };
  if (query.estado) {
    filtro.estado = query.estado;
  }
  const paginacion = getPagination(query);
  const [data, total] = await Promise.all([
    Paciente.find(filtro).sort({ apellidos: 1, nombres: 1 }).skip(paginacion.skip).limit(paginacion.limit),
    Paciente.countDocuments(filtro)
  ]);
  return { data, meta: buildMeta(paginacion, total) };
}

export async function obtener(id) {
  const paciente = await Paciente.findById(id);
  if (!paciente) {
    throw new ApiError(404, 'Paciente no encontrado');
  }
  return paciente;
}

export async function crear(datos, usuario) {
  const secuencia = await Contador.siguiente('paciente');
  return Paciente.create({
    ...mapearDatos(datos),
    codigo: `PAC-${String(secuencia).padStart(5, '0')}`,
    registradoPor: usuario._id
  });
}

export async function actualizar(id, datos) {
  const paciente = await obtener(id);
  paciente.set(mapearDatos(datos));
  await paciente.save();
  return paciente;
}

export async function cambiarEstado(id, estado) {
  const paciente = await obtener(id);
  paciente.estado = estado;
  await paciente.save();
  return paciente;
}
