import Responsable from '../models/Responsable.js';
import Paciente from '../models/Paciente.js';
import Contador from '../models/Contador.js';
import ApiError from '../utils/ApiError.js';
import { buildMeta, getPagination, searchRegex } from '../utils/pagination.js';

const CAMPOS = ['fotografia', 'nombres', 'apellidos', 'parentesco', 'telefono', 'correo', 'direccion'];
const POPULATE_PACIENTES = { path: 'pacientes', select: 'codigo nombres apellidos fechaNacimiento estado fotografia' };

function mapearDatos(datos) {
  return CAMPOS.reduce((acc, campo) => {
    if (datos[campo] !== undefined) {
      acc[campo] = datos[campo];
    }
    return acc;
  }, {});
}

async function validarPacientes(ids = []) {
  const unicos = [...new Set(ids.map(String))];
  if (unicos.length === 0) {
    return [];
  }
  const encontrados = await Paciente.countDocuments({ _id: { $in: unicos } });
  if (encontrados !== unicos.length) {
    throw new ApiError(404, 'Uno o más pacientes no existen');
  }
  return unicos;
}

export async function listar(query) {
  const filtro = {};
  if (query.paciente) {
    filtro.pacientes = query.paciente;
  }
  if (query.q) {
    const terminos = String(query.q).trim().split(/\s+/).filter(Boolean).slice(0, 5);
    filtro.$and = terminos.map((termino) => {
      const regex = searchRegex(termino);
      return { $or: [{ nombres: regex }, { apellidos: regex }, { codigo: regex }, { telefono: regex }, { correo: regex }] };
    });
  }
  const paginacion = getPagination(query);
  const [data, total] = await Promise.all([
    Responsable.find(filtro).populate(POPULATE_PACIENTES).sort({ apellidos: 1, nombres: 1 }).skip(paginacion.skip).limit(paginacion.limit),
    Responsable.countDocuments(filtro)
  ]);
  return { data, meta: buildMeta(paginacion, total) };
}

export async function obtener(id) {
  const responsable = await Responsable.findById(id).populate(POPULATE_PACIENTES);
  if (!responsable) {
    throw new ApiError(404, 'Responsable no encontrado');
  }
  return responsable;
}

export async function listarPorPaciente(pacienteId) {
  const existe = await Paciente.exists({ _id: pacienteId });
  if (!existe) {
    throw new ApiError(404, 'Paciente no encontrado');
  }
  return Responsable.find({ pacientes: pacienteId }).sort({ apellidos: 1 });
}

export async function crear(datos, usuario) {
  const pacientes = await validarPacientes(datos.pacientes);
  const secuencia = await Contador.siguiente('responsable');
  const responsable = await Responsable.create({
    ...mapearDatos(datos),
    pacientes,
    codigo: `RES-${String(secuencia).padStart(5, '0')}`,
    registradoPor: usuario._id
  });
  return obtener(responsable._id);
}

export async function actualizar(id, datos) {
  const responsable = await Responsable.findById(id);
  if (!responsable) {
    throw new ApiError(404, 'Responsable no encontrado');
  }
  responsable.set(mapearDatos(datos));
  await responsable.save();
  return obtener(id);
}

export async function asociarPaciente(id, pacienteId) {
  await validarPacientes([pacienteId]);
  const responsable = await Responsable.findByIdAndUpdate(id, { $addToSet: { pacientes: pacienteId } }, { new: true });
  if (!responsable) {
    throw new ApiError(404, 'Responsable no encontrado');
  }
  return obtener(id);
}

export async function desasociarPaciente(id, pacienteId) {
  const responsable = await Responsable.findByIdAndUpdate(id, { $pull: { pacientes: pacienteId } }, { new: true });
  if (!responsable) {
    throw new ApiError(404, 'Responsable no encontrado');
  }
  return obtener(id);
}

export async function tieneResponsable(pacienteId) {
  return Boolean(await Responsable.exists({ pacientes: pacienteId }));
}
