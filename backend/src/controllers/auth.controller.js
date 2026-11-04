import * as authService from '../services/auth.service.js';
import { ok } from '../utils/response.js';

export async function login(req, res) {
  const { correo, password } = req.body;
  const resultado = await authService.login(correo, password);
  ok(res, resultado);
}

export function me(req, res) {
  ok(res, req.user);
}

export async function cambiarPassword(req, res) {
  await authService.cambiarPassword(req.user._id, req.body.passwordActual, req.body.passwordNueva);
  ok(res, null, { message: 'Contraseña actualizada correctamente' });
}
