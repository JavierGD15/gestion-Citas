import * as citaService from '../services/cita.service.js';
import { created, ok } from '../utils/response.js';

export async function listar(req, res) {
  const { data, meta } = await citaService.listar(req.query, req.user);
  ok(res, data, { meta });
}

export async function calendario(req, res) {
  ok(res, await citaService.calendario(req.query, req.user));
}

export async function disponibilidad(req, res) {
  ok(res, await citaService.disponibilidad(req.query));
}

export async function obtener(req, res) {
  ok(res, await citaService.obtener(req.params.id, req.user));
}

export async function crear(req, res) {
  created(res, await citaService.crear(req.body, req.user), { message: 'Cita programada correctamente' });
}

export async function actualizar(req, res) {
  ok(res, await citaService.actualizar(req.params.id, req.body, req.user), { message: 'Cita actualizada correctamente' });
}

export async function cambiarEstado(req, res) {
  const cita = await citaService.cambiarEstado(req.params.id, req.body, req.user);
  ok(res, cita, { message: `Cita ${cita.estado.toLowerCase()} correctamente` });
}

export async function historialPaciente(req, res) {
  ok(res, await citaService.historialPaciente(req.params.id, req.user));
}
