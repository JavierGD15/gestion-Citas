import * as horarioService from '../services/horario.service.js';
import { ok } from '../utils/response.js';

export async function listar(req, res) {
  ok(res, await horarioService.listar());
}
