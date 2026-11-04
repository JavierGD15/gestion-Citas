import bcrypt from 'bcryptjs';
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

// Hash de relleno: si el correo no existe se compara igual contra él para que el tiempo
// de respuesta no revele qué correos están registrados.
const HASH_RELLENO = bcrypt.hashSync('sigca-hash-de-relleno', 12);

export async function login(correo, password) {
  const usuario = await Usuario.findOne({ correo }).select('+password');
  const valido = usuario ? await usuario.compararPassword(password) : (await bcrypt.compare(password, HASH_RELLENO)) && false;

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
