import * as usuarioService from '../services/usuario.service.js';
import { created, ok } from '../utils/response.js';

export async function listar(req, res) {
  const { data, meta } = await usuarioService.listar(req.query);
  ok(res, data, { meta });
}

export async function obtener(req, res) {
  ok(res, await usuarioService.obtener(req.params.id));
}

export async function crear(req, res) {
  created(res, await usuarioService.crear(req.body), { message: 'Usuario registrado correctamente' });
}

export async function actualizar(req, res) {
  const usuario = await usuarioService.actualizar(req.params.id, req.body, req.user);
  ok(res, usuario, { message: 'Usuario actualizado correctamente' });
}

export async function cambiarEstado(req, res) {
  const usuario = await usuarioService.cambiarEstado(req.params.id, req.body.estado, req.user);
  ok(res, usuario, { message: 'Estado del usuario actualizado' });
}

export async function restablecerPassword(req, res) {
  await usuarioService.restablecerPassword(req.params.id, req.body.password);
  ok(res, null, { message: 'Contraseña restablecida correctamente' });
}
