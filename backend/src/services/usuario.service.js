import Usuario from '../models/Usuario.js';
import ApiError from '../utils/ApiError.js';
import { buildMeta, escapeRegex, getPagination } from '../utils/pagination.js';
import { ESTADOS } from '../constants/index.js';

const CAMPOS_EDITABLES = ['nombres', 'apellidos', 'correo', 'rol'];

function pick(datos, campos) {
  return campos.reduce((acc, campo) => {
    if (datos[campo] !== undefined) {
      acc[campo] = datos[campo];
    }
    return acc;
  }, {});
}

export async function listar(query) {
  const filtro = {};
  if (query.rol) {
    filtro.rol = query.rol;
  }
  if (query.estado) {
    filtro.estado = query.estado;
  }
  if (query.q) {
    const regex = new RegExp(escapeRegex(query.q), 'i');
    filtro.$or = [{ nombres: regex }, { apellidos: regex }, { correo: regex }];
  }

  const paginacion = getPagination(query);
  const [data, total] = await Promise.all([
    Usuario.find(filtro).sort({ nombres: 1, apellidos: 1 }).skip(paginacion.skip).limit(paginacion.limit),
    Usuario.countDocuments(filtro)
  ]);

  return { data, meta: buildMeta(paginacion, total) };
}

export async function obtener(id) {
  const usuario = await Usuario.findById(id);
  if (!usuario) {
    throw new ApiError(404, 'Usuario no encontrado');
  }
  return usuario;
}

export async function crear(datos) {
  const usuario = await Usuario.create({ ...pick(datos, CAMPOS_EDITABLES), password: datos.password });
  return usuario;
}

export async function actualizar(id, datos, usuarioActual) {
  const usuario = await obtener(id);
  const cambios = pick(datos, CAMPOS_EDITABLES);

  if (usuario._id.equals(usuarioActual._id) && cambios.rol && cambios.rol !== usuario.rol) {
    throw new ApiError(400, 'No puede cambiar su propio rol');
  }

  usuario.set(cambios);
  await usuario.save();
  return usuario;
}

export async function cambiarEstado(id, estado, usuarioActual) {
  const usuario = await obtener(id);

  if (usuario._id.equals(usuarioActual._id) && estado === ESTADOS.INACTIVO) {
    throw new ApiError(400, 'No puede desactivar su propio usuario');
  }

  usuario.estado = estado;
  await usuario.save();
  return usuario;
}

export async function restablecerPassword(id, password) {
  const usuario = await Usuario.findById(id).select('+password');
  if (!usuario) {
    throw new ApiError(404, 'Usuario no encontrado');
  }
  usuario.password = password;
  await usuario.save();
}
