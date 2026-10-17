import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import Usuario from '../models/Usuario.js';
import ApiError from '../utils/ApiError.js';
import { ESTADOS } from '../constants/index.js';

export async function authenticate(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new ApiError(401, 'Autenticación requerida');
  }

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
  } catch {
    throw new ApiError(401, 'La sesión no es válida o ha expirado');
  }

  const usuario = await Usuario.findById(payload.sub);
  if (!usuario || usuario.estado !== ESTADOS.ACTIVO) {
    throw new ApiError(401, 'Usuario no autorizado');
  }

  req.user = usuario;
  next();
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Autenticación requerida'));
    }
    if (roles.length > 0 && !roles.includes(req.user.rol)) {
      return next(new ApiError(403, 'No tiene permisos para realizar esta operación'));
    }
    return next();
  };
}

export async function optionalAuthenticate(req, res, next) {
  if (!req.headers.authorization) {
    return next();
  }
  return authenticate(req, res, next);
}
