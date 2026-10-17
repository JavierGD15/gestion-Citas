import * as servicioService from '../services/servicio.service.js';
import { created, ok } from '../utils/response.js';

export async function listar(req, res) {
  ok(res, await servicioService.listar(req.query, req.user));
}

export async function obtener(req, res) {
  ok(res, await servicioService.obtener(req.params.id, req.user));
}

export async function crear(req, res) {
  created(res, await servicioService.crear(req.body), { message: 'Servicio registrado correctamente' });
}

export async function actualizar(req, res) {
  ok(res, await servicioService.actualizar(req.params.id, req.body), { message: 'Servicio actualizado correctamente' });
}

export async function cambiarEstado(req, res) {
  ok(res, await servicioService.cambiarEstado(req.params.id, req.body.estado), { message: 'Estado del servicio actualizado' });
}
