import * as materialService from '../services/material.service.js';
import { created, ok } from '../utils/response.js';

export async function listar(req, res) {
  const { data, meta } = await materialService.listar(req.query);
  ok(res, data, { meta });
}

export async function obtener(req, res) {
  ok(res, await materialService.obtener(req.params.id));
}

export async function crear(req, res) {
  created(res, await materialService.crear(req.body, req.user), { message: 'Material registrado correctamente' });
}

export async function actualizar(req, res) {
  ok(res, await materialService.actualizar(req.params.id, req.body), { message: 'Material actualizado correctamente' });
}

export async function cambiarEstado(req, res) {
  ok(res, await materialService.cambiarEstado(req.params.id, req.body.estado), { message: 'Estado del material actualizado' });
}

export async function asignar(req, res) {
  created(res, await materialService.asignar(req.params.id, req.body, req.user), { message: 'Material asignado correctamente' });
}

export async function asignacionesPorMaterial(req, res) {
  ok(res, await materialService.asignacionesPorMaterial(req.params.id, req.user));
}

export async function asignacionesPorPaciente(req, res) {
  ok(res, await materialService.asignacionesPorPaciente(req.params.id, req.user));
}

export async function retirarAsignacion(req, res) {
  ok(res, await materialService.retirarAsignacion(req.params.asignacionId, req.user), { message: 'Asignación retirada' });
}
