import { ipKeyGenerator, rateLimit } from 'express-rate-limit';
import env from '../config/env.js';

function crearLimitador({ windowMs, limit, message, ...opciones }) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skip: () => env.nodeEnv === 'test',
    handler: (req, res, next, options) => {
      res.status(options.statusCode).json({ ok: false, message });
    },
    ...opciones
  });
}

export const limitadorGeneral = crearLimitador({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  message: 'Demasiadas solicitudes. Intente de nuevo en unos minutos'
});

export const limitadorLogin = crearLimitador({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => `${ipKeyGenerator(req.ip)}:${String(req.body?.correo || '').toLowerCase()}`,
  message: 'Demasiados intentos de inicio de sesión fallidos. Intente de nuevo en 15 minutos'
});

export const limitadorFormularios = crearLimitador({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  message: 'Ha enviado demasiados formularios. Intente de nuevo más tarde'
});
