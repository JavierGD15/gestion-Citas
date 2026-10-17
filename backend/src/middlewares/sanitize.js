import ApiError from '../utils/ApiError.js';

const PROFUNDIDAD_MAXIMA = 6;

function contieneOperadores(valor, profundidad = 0) {
  if (profundidad > PROFUNDIDAD_MAXIMA) {
    return true;
  }
  if (Array.isArray(valor)) {
    return valor.some((item) => contieneOperadores(item, profundidad + 1));
  }
  if (valor && typeof valor === 'object') {
    return Object.entries(valor).some(
      ([clave, item]) => clave.startsWith('$') || clave.includes('.') || clave === '__proto__' || clave === 'constructor' || contieneOperadores(item, profundidad + 1)
    );
  }
  return false;
}

function queryValida(query) {
  return Object.entries(query || {}).every(([clave, valor]) => typeof valor === 'string' && !clave.includes('$') && valor.length <= 200);
}

export default function rechazarOperadores(req, res, next) {
  if (contieneOperadores(req.body) || contieneOperadores(req.params)) {
    return next(new ApiError(400, 'La solicitud contiene campos no permitidos'));
  }
  if (!queryValida(req.query)) {
    return next(new ApiError(400, 'Los parámetros de consulta no son válidos'));
  }
  return next();
}
