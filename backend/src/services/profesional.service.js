import Profesional from '../models/Profesional.js';
import Usuario from '../models/Usuario.js';
import ApiError from '../utils/ApiError.js';
import { searchRegex } from '../utils/pagination.js';
import { ESTADOS, ROLES } from '../constants/index.js';

const CAMPOS_PERFIL = ['especialidad', 'colegiado', 'telefono', 'descripcion', 'fotografia'];
const CAMPOS_USUARIO = ['nombres', 'apellidos', 'correo'];
const POPULATE_USUARIO = { path: 'usuario', select: 'nombres apellidos correo estado rol' };

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
  if (query.estado) {
    filtro.estado = query.estado;
  }
  if (query.q) {
    const regex = searchRegex(query.q);
    const usuarios = await Usuario.find({ rol: ROLES.PROFESIONAL, $or: [{ nombres: regex }, { apellidos: regex }] }).select('_id');
    filtro.$or = [{ especialidad: regex }, { usuario: { $in: usuarios.map((u) => u._id) } }];
  }
  const profesionales = await Profesional.find(filtro).populate(POPULATE_USUARIO);
  return profesionales.sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto, 'es'));
}

export async function obtener(id) {
  const profesional = await Profesional.findById(id).populate(POPULATE_USUARIO);
  if (!profesional) {
    throw new ApiError(404, 'Profesional no encontrado');
  }
  return profesional;
}

export async function obtenerPorUsuario(usuarioId) {
  return Profesional.findOne({ usuario: usuarioId }).populate(POPULATE_USUARIO);
}

export async function crear(datos) {
  let usuario;
  let usuarioCreado = false;

  if (datos.usuarioId) {
    usuario = await Usuario.findById(datos.usuarioId);
    if (!usuario || usuario.rol !== ROLES.PROFESIONAL) {
      throw new ApiError(400, 'El usuario seleccionado no existe o no tiene el rol PROFESIONAL');
    }
    if (await Profesional.exists({ usuario: usuario._id })) {
      throw new ApiError(409, 'El usuario ya tiene un perfil profesional');
    }
  } else {
    usuario = await Usuario.create({ ...pick(datos, CAMPOS_USUARIO), password: datos.password, rol: ROLES.PROFESIONAL });
    usuarioCreado = true;
  }

  try {
    const profesional = await Profesional.create({ ...pick(datos, CAMPOS_PERFIL), usuario: usuario._id });
    return obtener(profesional._id);
  } catch (error) {
    if (usuarioCreado) {
      await Usuario.deleteOne({ _id: usuario._id });
    }
    throw error;
  }
}

export async function actualizar(id, datos) {
  const profesional = await Profesional.findById(id);
  if (!profesional) {
    throw new ApiError(404, 'Profesional no encontrado');
  }
  const cambiosUsuario = pick(datos, CAMPOS_USUARIO);
  if (Object.keys(cambiosUsuario).length > 0) {
    const usuario = await Usuario.findById(profesional.usuario);
    usuario.set(cambiosUsuario);
    await usuario.save();
  }
  profesional.set(pick(datos, CAMPOS_PERFIL));
  await profesional.save();
  return obtener(id);
}

export async function cambiarEstado(id, estado) {
  const profesional = await Profesional.findById(id);
  if (!profesional) {
    throw new ApiError(404, 'Profesional no encontrado');
  }
  profesional.estado = estado;
  await profesional.save();
  return obtener(id);
}

export async function obtenerActivo(id) {
  const profesional = await Profesional.findById(id).populate(POPULATE_USUARIO);
  if (!profesional) {
    throw new ApiError(404, 'Profesional no encontrado');
  }
  if (profesional.estado !== ESTADOS.ACTIVO || profesional.usuario?.estado !== ESTADOS.ACTIVO) {
    throw new ApiError(422, 'El profesional seleccionado no está activo');
  }
  return profesional;
}
