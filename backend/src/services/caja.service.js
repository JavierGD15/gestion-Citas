import Caja from '../models/Caja.js';
import Contador from '../models/Contador.js';
import Pago from '../models/Pago.js';
import ApiError from '../utils/ApiError.js';
import { rangoDiaLocal } from '../utils/fechas.js';
import { fromCents, toCents } from '../utils/money.js';
import { buildMeta, getPagination } from '../utils/pagination.js';
import { totalesPorCaja } from './finanzas.service.js';
import { ESTADOS_CAJA, ROLES } from '../constants/index.js';

export const POPULATE_CAJA = [
  { path: 'usuario', select: 'nombres apellidos correo rol' },
  { path: 'cerradoPor', select: 'nombres apellidos' }
];

export function resumenEnVivo(caja, totales) {
  const efectivoEsperado = caja.montoInicialCentavos + totales.efectivo;
  return {
    montoInicial: fromCents(caja.montoInicialCentavos),
    totalEfectivo: fromCents(totales.efectivo),
    totalTransferencia: fromCents(totales.transferencia),
    totalTarjeta: fromCents(totales.tarjeta),
    totalIngresos: fromCents(totales.ingresos),
    efectivoEsperado: fromCents(efectivoEsperado),
    efectivoEsperadoCentavos: efectivoEsperado,
    cantidadPagos: totales.cantidadPagos,
    cantidadAnulados: totales.cantidadAnulados,
    montoAnulado: fromCents(totales.montoAnulado)
  };
}

export async function conResumen(caja) {
  const totales = await totalesPorCaja(caja._id);
  return { ...caja.toJSON(), resumen: resumenEnVivo(caja, totales) };
}

export async function abrir({ montoInicial, observaciones }, usuario) {
  const existente = await Caja.findOne({ usuario: usuario._id, estado: ESTADOS_CAJA.ABIERTA });
  if (existente) {
    throw new ApiError(409, `Ya tiene una caja abierta (${existente.codigo}). Debe cerrarla antes de abrir otra`);
  }
  const secuencia = await Contador.siguiente('caja');
  try {
    const caja = await Caja.create({
      codigo: `CAJ-${String(secuencia).padStart(5, '0')}`,
      usuario: usuario._id,
      montoInicialCentavos: toCents(montoInicial),
      observacionesApertura: observaciones || ''
    });
    return conResumen(await Caja.findById(caja._id).populate(POPULATE_CAJA));
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, 'Ya tiene una caja abierta. Debe cerrarla antes de abrir otra');
    }
    throw error;
  }
}

export async function obtenerAbierta(usuarioId) {
  return Caja.findOne({ usuario: usuarioId, estado: ESTADOS_CAJA.ABIERTA }).populate(POPULATE_CAJA);
}

export async function actual(usuario) {
  const caja = await obtenerAbierta(usuario._id);
  return caja ? conResumen(caja) : null;
}

function resumenCerrada(caja) {
  return {
    montoInicial: fromCents(caja.montoInicialCentavos),
    totalEfectivo: fromCents(caja.totalEfectivoCentavos),
    totalTransferencia: fromCents(caja.totalTransferenciaCentavos),
    totalTarjeta: fromCents(caja.totalTarjetaCentavos),
    totalIngresos: fromCents(caja.totalIngresosCentavos),
    efectivoEsperado: fromCents(caja.efectivoEsperadoCentavos),
    efectivoContado: fromCents(caja.efectivoContadoCentavos),
    diferencia: fromCents(caja.diferenciaCentavos),
    cantidadPagos: caja.cantidadPagos,
    cantidadAnulados: caja.cantidadAnulados
  };
}

async function detalle(caja) {
  if (caja.estado === ESTADOS_CAJA.CERRADA) {
    return { ...caja.toJSON(), resumen: resumenCerrada(caja) };
  }
  return conResumen(caja);
}

function verificarAcceso(caja, usuario) {
  const usuarioId = caja.usuario?._id || caja.usuario;
  if (usuario.rol !== ROLES.ADMINISTRADOR && !usuarioId.equals(usuario._id)) {
    throw new ApiError(403, 'Solo puede consultar y gestionar sus propias cajas');
  }
}

export async function listar(query, usuario) {
  const filtro = {};
  if (usuario.rol !== ROLES.ADMINISTRADOR) {
    filtro.usuario = usuario._id;
  } else if (query.usuario) {
    filtro.usuario = query.usuario;
  }
  if (query.estado) {
    filtro.estado = query.estado;
  }
  if (query.desde || query.hasta) {
    filtro.fechaApertura = {};
    if (query.desde) {
      filtro.fechaApertura.$gte = rangoDiaLocal(query.desde).inicio;
    }
    if (query.hasta) {
      filtro.fechaApertura.$lt = rangoDiaLocal(query.hasta).fin;
    }
  }
  const paginacion = getPagination(query);
  const [cajas, total] = await Promise.all([
    Caja.find(filtro).populate(POPULATE_CAJA).sort({ fechaApertura: -1 }).skip(paginacion.skip).limit(paginacion.limit),
    Caja.countDocuments(filtro)
  ]);
  return { data: await Promise.all(cajas.map(detalle)), meta: buildMeta(paginacion, total) };
}

export async function obtener(id, usuario) {
  const caja = await Caja.findById(id).populate(POPULATE_CAJA);
  if (!caja) {
    throw new ApiError(404, 'Caja no encontrada');
  }
  verificarAcceso(caja, usuario);
  return detalle(caja);
}

export async function movimientos(id, usuario) {
  const caja = await Caja.findById(id);
  if (!caja) {
    throw new ApiError(404, 'Caja no encontrada');
  }
  verificarAcceso(caja, usuario);
  return Pago.find({ caja: caja._id })
    .populate([
      { path: 'paciente', select: 'codigo nombres apellidos' },
      { path: 'cita', select: 'codigo fecha horaInicio servicio', populate: { path: 'servicio', select: 'nombre' } },
      { path: 'registradoPor', select: 'nombres apellidos' },
      { path: 'anuladoPor', select: 'nombres apellidos' }
    ])
    .sort({ fechaPago: 1 });
}

function camposCierre(caja, totales, efectivoContadoCentavos) {
  const efectivoEsperadoCentavos = caja.montoInicialCentavos + totales.efectivo;
  return {
    totalEfectivoCentavos: totales.efectivo,
    totalTransferenciaCentavos: totales.transferencia,
    totalTarjetaCentavos: totales.tarjeta,
    totalIngresosCentavos: totales.ingresos,
    efectivoEsperadoCentavos,
    efectivoContadoCentavos,
    diferenciaCentavos: efectivoContadoCentavos - efectivoEsperadoCentavos,
    cantidadPagos: totales.cantidadPagos,
    cantidadAnulados: totales.cantidadAnulados
  };
}

export async function cerrar(id, { efectivoContado, observaciones }, usuario) {
  const caja = await Caja.findById(id);
  if (!caja) {
    throw new ApiError(404, 'Caja no encontrada');
  }
  verificarAcceso(caja, usuario);
  if (caja.estado === ESTADOS_CAJA.CERRADA) {
    throw new ApiError(422, 'La caja ya se encuentra cerrada y no puede modificarse');
  }

  const efectivoContadoCentavos = toCents(efectivoContado);
  const totales = await totalesPorCaja(caja._id);

  const cerrada = await Caja.findOneAndUpdate(
    { _id: caja._id, estado: ESTADOS_CAJA.ABIERTA },
    {
      ...camposCierre(caja, totales, efectivoContadoCentavos),
      estado: ESTADOS_CAJA.CERRADA,
      fechaCierre: new Date(),
      cerradoPor: usuario._id,
      observacionesCierre: observaciones || ''
    },
    { new: true }
  );
  if (!cerrada) {
    throw new ApiError(409, 'La caja ya fue cerrada por otro usuario');
  }

  const verificacion = await totalesPorCaja(caja._id);
  if (verificacion.ingresos !== totales.ingresos || verificacion.cantidadAnulados !== totales.cantidadAnulados) {
    await Caja.updateOne({ _id: caja._id }, camposCierre(caja, verificacion, efectivoContadoCentavos));
  }

  return obtener(caja._id, usuario);
}
