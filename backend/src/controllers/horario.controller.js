import * as horarioService from '../services/horario.service.js';
import { ok } from '../utils/response.js';

export async function listar(req, res) {
  ok(res, await horarioService.listar());
}

export async function actualizar(req, res) {
  ok(res, await horarioService.actualizar(req.body.horarios), { message: 'Horarios actualizados correctamente' });
}
