import * as contenidoService from '../services/contenido.service.js';
import { ok } from '../utils/response.js';

export async function listar(req, res) {
  ok(res, await contenidoService.listarPublico(req.query));
}

export async function publico(req, res) {
  ok(res, await contenidoService.obtenerPublico());
}
