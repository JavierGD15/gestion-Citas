import Material from '../models/Material.js';
import AsignacionMaterial from '../models/AsignacionMaterial.js';
import Paciente from '../models/Paciente.js';
import Contador from '../models/Contador.js';
import ApiError from '../utils/ApiError.js';
import { buildMeta, getPagination, searchRegex } from '../utils/pagination.js';
import { pacientesDelProfesional } from './cita.service.js';
import { ESTADOS, ROLES } from '../constants/index.js';

const CAMPOS = ['titulo', 'descripcion', 'tipo', 'enlace'];
const POPULATE_ASIGNACION = [
  { path: 'material', select: 'codigo titulo tipo enlace estado descripcion' },
  { path: 'paciente', select: 'codigo nombres apellidos fotografia estado' },
  { path: 'asignadoPor', select: 'nombres apellidos rol' },
  { path: 'retiradoPor', select: 'nombres apellidos' }
];

function mapearDatos(datos) {
  return CAMPOS.reduce((acc, campo) => {
    if (datos[campo] !== undefined) {
      acc[campo] = datos[campo];
    }
    return acc;
  }, {});
}

async function verificarPacienteDelProfesional(usuario, pacienteId) {
  if (usuario.rol !== ROLES.PROFESIONAL) {
    return;
  }
  const ids = await pacientesDelProfesional(usuario);
  if (!ids.some((id) => id.equals(pacienteId))) {
    throw new ApiError(403, 'Solo puede gestionar materiales de pacientes con citas asignadas a usted');
  }
}

export async function listar(query) {
  const filtro = {};
  if (query.tipo) {
    filtro.tipo = query.tipo;
  }
  if (query.estado) {
    filtro.estado = query.estado;
  }
  if (query.q) {
    const regex = searchRegex(query.q);
    filtro.$or = [{ titulo: regex }, { descripcion: regex }, { codigo: regex }];
  }
  const paginacion = getPagination(query);
  const [data, total] = await Promise.all([
    Material.find(filtro).sort({ fechaRegistro: -1 }).skip(paginacion.skip).limit(paginacion.limit),
    Material.countDocuments(filtro)
  ]);
  return { data, meta: buildMeta(paginacion, total) };
}

export async function obtener(id) {
  const material = await Material.findById(id);
  if (!material) {
    throw new ApiError(404, 'Material no encontrado');
  }
  return material;
}

export async function crear(datos, usuario) {
  const secuencia = await Contador.siguiente('material');
  return Material.create({
    ...mapearDatos(datos),
    codigo: `MAT-${String(secuencia).padStart(5, '0')}`,
    registradoPor: usuario._id
  });
}

export async function actualizar(id, datos) {
  const material = await obtener(id);
  material.set(mapearDatos(datos));
  await material.save();
  return material;
}

export async function cambiarEstado(id, estado) {
  const material = await obtener(id);
  material.estado = estado;
  await material.save();
  return material;
}

export async function asignar(materialId, { paciente: pacienteId, indicaciones }, usuario) {
  const material = await obtener(materialId);
  if (material.estado !== ESTADOS.ACTIVO) {
    throw new ApiError(422, 'Solo pueden asignarse materiales activos');
  }

  const paciente = await Paciente.findById(pacienteId);
  if (!paciente) {
    throw new ApiError(404, 'Paciente no encontrado');
  }
  if (paciente.estado !== ESTADOS.ACTIVO) {
    throw new ApiError(422, 'Los materiales solamente pueden asignarse a pacientes activos');
  }

  await verificarPacienteDelProfesional(usuario, paciente._id);

  const existente = await AsignacionMaterial.exists({ material: material._id, paciente: paciente._id, estado: ESTADOS.ACTIVO });
  if (existente) {
    throw new ApiError(409, 'El material ya está asignado a este paciente');
  }

  const asignacion = await AsignacionMaterial.create({
    material: material._id,
    paciente: paciente._id,
    asignadoPor: usuario._id,
    indicaciones: indicaciones || ''
  });
  return AsignacionMaterial.findById(asignacion._id).populate(POPULATE_ASIGNACION);
}

export async function asignacionesPorMaterial(materialId, usuario) {
  await obtener(materialId);
  const filtro = { material: materialId };
  if (usuario.rol === ROLES.PROFESIONAL) {
    filtro.paciente = { $in: await pacientesDelProfesional(usuario) };
  }
  return AsignacionMaterial.find(filtro).populate(POPULATE_ASIGNACION).sort({ fechaAsignacion: -1 });
}

export async function asignacionesPorPaciente(pacienteId, usuario) {
  if (!(await Paciente.exists({ _id: pacienteId }))) {
    throw new ApiError(404, 'Paciente no encontrado');
  }
  await verificarPacienteDelProfesional(usuario, pacienteId);
  return AsignacionMaterial.find({ paciente: pacienteId }).populate(POPULATE_ASIGNACION).sort({ estado: 1, fechaAsignacion: -1 });
}

export async function retirarAsignacion(asignacionId, usuario) {
  const asignacion = await AsignacionMaterial.findById(asignacionId);
  if (!asignacion) {
    throw new ApiError(404, 'Asignación no encontrada');
  }
  await verificarPacienteDelProfesional(usuario, asignacion.paciente);
  if (asignacion.estado !== ESTADOS.ACTIVO) {
    throw new ApiError(422, 'La asignación ya fue retirada');
  }
  asignacion.set({ estado: ESTADOS.INACTIVO, retiradoPor: usuario._id, fechaRetiro: new Date() });
  await asignacion.save();
  return AsignacionMaterial.findById(asignacion._id).populate(POPULATE_ASIGNACION);
}
