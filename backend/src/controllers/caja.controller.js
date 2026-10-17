import * as cajaService from '../services/caja.service.js';
import { created, ok } from '../utils/response.js';

export async function abrir(req, res) {
  created(res, await cajaService.abrir(req.body, req.user), { message: 'Caja abierta correctamente' });
}

export async function actual(req, res) {
  ok(res, await cajaService.actual(req.user));
}
