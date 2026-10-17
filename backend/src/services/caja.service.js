import Caja from '../models/Caja.js';
import Contador from '../models/Contador.js';
import ApiError from '../utils/ApiError.js';
import { fromCents, toCents } from '../utils/money.js';
import { totalesPorCaja } from './finanzas.service.js';
import { ESTADOS_CAJA } from '../constants/index.js';

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
