import * as responsableService from '../services/responsable.service.js';
import { created, ok } from '../utils/response.js';

export async function listar(req, res) {
  const { data, meta } = await responsableService.listar(req.query);
  ok(res, data, { meta });
}

export async function obtener(req, res) {
  ok(res, await responsableService.obtener(req.params.id));
}

export async function listarPorPaciente(req, res) {
  ok(res, await responsableService.listarPorPaciente(req.params.id));
}

export async function crear(req, res) {
  created(res, await responsableService.crear(req.body, req.user), { message: 'Responsable registrado correctamente' });
}

export async function actualizar(req, res) {
  ok(res, await responsableService.actualizar(req.params.id, req.body), { message: 'Responsable actualizado correctamente' });
}

export async function asociarPaciente(req, res) {
  ok(res, await responsableService.asociarPaciente(req.params.id, req.body.paciente), { message: 'Paciente asociado correctamente' });
}

export async function desasociarPaciente(req, res) {
  ok(res, await responsableService.desasociarPaciente(req.params.id, req.params.pacienteId), { message: 'Paciente desasociado correctamente' });
}
