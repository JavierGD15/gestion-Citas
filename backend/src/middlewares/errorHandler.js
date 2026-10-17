import env from '../config/env.js';

export default function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const isServerError = statusCode >= 500;

  if (isServerError) {
    console.error(err);
  }

  const body = {
    ok: false,
    message: isServerError && env.nodeEnv === 'production' ? 'Error interno del servidor' : err.message
  };

  if (err.details) {
    body.details = err.details;
  }

  res.status(statusCode).json(body);
}
