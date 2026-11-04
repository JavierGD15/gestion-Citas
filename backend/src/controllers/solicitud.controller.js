import * as solicitudService from '../services/solicitud.service.js';
import { created, ok } from '../utils/response.js';

export async function crear(req, res) {
  await solicitudService.crear(req.body);
  created(res, null, {
    message: 'Solicitud enviada correctamente. Nos comunicaremos con usted para confirmar la fecha y hora de su cita.'
  });
}

export async function listar(req, res) {
  const { data, meta } = await solicitudService.listar(req.query);
  ok(res, data, { meta });
}

export async function obtener(req, res) {
  ok(res, await solicitudService.obtener(req.params.id));
}

export async function rechazar(req, res) {
  ok(res, await solicitudService.rechazar(req.params.id, req.body.motivo, req.user), { message: 'Solicitud rechazada' });
}

export async function convertir(req, res) {
  created(res, await solicitudService.convertirEnCita(req.params.id, req.body, req.user), {
    message: 'Solicitud atendida y cita programada correctamente'
  });
}
