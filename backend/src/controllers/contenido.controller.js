import * as contenidoService from '../services/contenido.service.js';
import { created, ok } from '../utils/response.js';

export async function listar(req, res) {
  ok(res, await contenidoService.listarPublico(req.query));
}

export async function publico(req, res) {
  ok(res, await contenidoService.obtenerPublico());
}

export async function listarAdmin(req, res) {
  ok(res, await contenidoService.listarAdmin(req.query));
}

export async function crear(req, res) {
  created(res, await contenidoService.crear(req.body, req.user), { message: 'Contenido publicado correctamente' });
}

export async function actualizar(req, res) {
  ok(res, await contenidoService.actualizar(req.params.id, req.body, req.user), { message: 'Contenido actualizado correctamente' });
}

export async function cambiarEstado(req, res) {
  ok(res, await contenidoService.cambiarEstado(req.params.id, req.body.estado, req.user), { message: 'Estado del contenido actualizado' });
}
