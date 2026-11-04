import * as contactoService from '../services/contacto.service.js';
import { created, ok } from '../utils/response.js';

export async function crear(req, res) {
  await contactoService.crear(req.body);
  created(res, null, { message: 'Mensaje enviado correctamente. Pronto nos pondremos en contacto.' });
}

export async function listar(req, res) {
  const { data, meta } = await contactoService.listar(req.query);
  ok(res, data, { meta });
}

export async function marcarLeido(req, res) {
  ok(res, await contactoService.marcarLeido(req.params.id, req.user));
}
