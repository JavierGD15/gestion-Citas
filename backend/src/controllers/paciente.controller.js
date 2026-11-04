import * as pacienteService from '../services/paciente.service.js';
import { created, ok } from '../utils/response.js';

export async function listar(req, res) {
  const { data, meta } = await pacienteService.listar(req.query);
  ok(res, data, { meta });
}

export async function obtener(req, res) {
  ok(res, await pacienteService.obtener(req.params.id));
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
