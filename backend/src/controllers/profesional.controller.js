import * as profesionalService from '../services/profesional.service.js';
import ApiError from '../utils/ApiError.js';
import { created, ok } from '../utils/response.js';

export async function listar(req, res) {
  ok(res, await profesionalService.listar(req.query));
}

export async function obtener(req, res) {
  ok(res, await profesionalService.obtener(req.params.id));
}

export async function miPerfil(req, res) {
  const profesional = await profesionalService.obtenerPorUsuario(req.user._id);
  if (!profesional) {
    throw new ApiError(404, 'El usuario no tiene un perfil profesional');
  }
  ok(res, profesional);
}

export async function crear(req, res) {
  created(res, await profesionalService.crear(req.body), { message: 'Profesional registrado correctamente' });
}

export async function actualizar(req, res) {
  ok(res, await profesionalService.actualizar(req.params.id, req.body), { message: 'Profesional actualizado correctamente' });
}

export async function cambiarEstado(req, res) {
  ok(res, await profesionalService.cambiarEstado(req.params.id, req.body.estado), { message: 'Estado del profesional actualizado' });
}
