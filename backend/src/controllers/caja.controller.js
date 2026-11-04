import * as cajaService from '../services/caja.service.js';
import { created, ok } from '../utils/response.js';

export async function abrir(req, res) {
  created(res, await cajaService.abrir(req.body, req.user), { message: 'Caja abierta correctamente' });
}

export async function actual(req, res) {
  ok(res, await cajaService.actual(req.user));
}

export async function listar(req, res) {
  const { data, meta } = await cajaService.listar(req.query, req.user);
  ok(res, data, { meta });
}

export async function obtener(req, res) {
  ok(res, await cajaService.obtener(req.params.id, req.user));
}

export async function movimientos(req, res) {
  ok(res, await cajaService.movimientos(req.params.id, req.user));
}

export async function cerrar(req, res) {
  ok(res, await cajaService.cerrar(req.params.id, req.body, req.user), { message: 'Caja cerrada correctamente' });
}
