import * as pacienteService from '../services/paciente.service.js';
import { pacientesDelProfesional } from '../services/cita.service.js';
import ApiError from '../utils/ApiError.js';
import { created, ok } from '../utils/response.js';
import { ROLES } from '../constants/index.js';

const CAMPOS_BASICOS = ['_id', 'codigo', 'fotografia', 'nombres', 'apellidos', 'nombreCompleto', 'fechaNacimiento', 'edad', 'esMenor', 'sexo', 'estado'];

function datosBasicos(paciente) {
  const json = paciente.toJSON();
  return Object.fromEntries(CAMPOS_BASICOS.map((campo) => [campo, json[campo]]));
}

async function verificarAccesoProfesional(req, pacienteId) {
  if (req.user.rol !== ROLES.PROFESIONAL) {
    return;
  }
  const ids = await pacientesDelProfesional(req.user);
  if (!ids.some((id) => id.equals(pacienteId))) {
    throw new ApiError(403, 'Solo puede consultar pacientes con citas asignadas a usted');
  }
}

export async function listar(req, res) {
  if (req.user.rol === ROLES.PROFESIONAL) {
    const ids = await pacientesDelProfesional(req.user);
    const { data, meta } = await pacienteService.listar(req.query, { _id: { $in: ids } });
    return ok(res, data.map(datosBasicos), { meta });
  }
  const { data, meta } = await pacienteService.listar(req.query);
  return ok(res, data, { meta });
}

export async function obtener(req, res) {
  const paciente = await pacienteService.obtener(req.params.id);
  if (req.user.rol === ROLES.PROFESIONAL) {
    await verificarAccesoProfesional(req, paciente._id);
    return ok(res, datosBasicos(paciente));
  }
  return ok(res, paciente);
}

export async function crear(req, res) {
  created(res, await pacienteService.crear(req.body, req.user), { message: 'Paciente registrado correctamente' });
}

export async function actualizar(req, res) {
  ok(res, await pacienteService.actualizar(req.params.id, req.body), { message: 'Paciente actualizado correctamente' });
}

export async function cambiarEstado(req, res) {
  const paciente = await pacienteService.cambiarEstado(req.params.id, req.body.estado);
  ok(res, paciente, { message: `Paciente ${paciente.estado === 'ACTIVO' ? 'activado' : 'desactivado'} correctamente` });
}
