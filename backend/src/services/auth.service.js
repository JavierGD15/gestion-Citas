import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import Usuario from '../models/Usuario.js';
import ApiError from '../utils/ApiError.js';
import { ESTADOS } from '../constants/index.js';

export function generarToken(usuario) {
  return jwt.sign({ sub: usuario._id.toString(), rol: usuario.rol }, env.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: env.jwtExpiresIn
  });
}

export async function login(correo, password) {
  const usuario = await Usuario.findOne({ correo }).select('+password');
  const valido = usuario ? await usuario.compararPassword(password) : false;

  if (!valido) {
    throw new ApiError(401, 'Correo o contraseña incorrectos');
  }

  if (usuario.estado !== ESTADOS.ACTIVO) {
    throw new ApiError(403, 'El usuario se encuentra inactivo');
  }

  return { token: generarToken(usuario), usuario: usuario.toJSON() };
}

export async function cambiarPassword(usuarioId, passwordActual, passwordNueva) {
  const usuario = await Usuario.findById(usuarioId).select('+password');
  if (!usuario || !(await usuario.compararPassword(passwordActual))) {
    throw new ApiError(400, 'La contraseña actual es incorrecta');
  }
  usuario.password = passwordNueva;
  await usuario.save();
}
