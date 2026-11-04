import env from '../config/env.js';

function normalizeError(err) {
  if (err.name === 'ValidationError' && err.errors) {
    return {
      statusCode: 400,
      message: 'Los datos enviados no son válidos',
      details: Object.values(err.errors).map((error) => ({ campo: error.path, mensaje: error.message }))
    };
  }

  if (err.name === 'CastError') {
    return { statusCode: 400, message: `Valor inválido para el campo ${err.path}` };
  }

  if (err.code === 11000) {
    const campos = Object.keys(err.keyValue || err.keyPattern || {}).join(', ');
    return { statusCode: 409, message: `Ya existe un registro con el mismo valor en: ${campos}` };
  }

  if (err.type === 'entity.parse.failed') {
    return { statusCode: 400, message: 'El cuerpo de la solicitud no es un JSON válido' };
  }

  if (err.type === 'entity.too.large') {
    return { statusCode: 413, message: 'El cuerpo de la solicitud excede el tamaño permitido' };
  }

  return { statusCode: err.statusCode || 500, message: err.message, details: err.details };
}

export default function errorHandler(err, req, res, next) {
  const { statusCode, message, details } = normalizeError(err);
  const isServerError = statusCode >= 500;

  if (isServerError) {
    console.error(err);
  }

  const body = {
    ok: false,
    message: isServerError && env.nodeEnv === 'production' ? 'Error interno del servidor' : message
  };

  if (details) {
    body.details = details;
  }

  res.status(statusCode).json(body);
}
