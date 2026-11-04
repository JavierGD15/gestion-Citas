import mongoose from 'mongoose';
import Pago from '../models/Pago.js';
import { fromCents } from '../utils/money.js';
import { ESTADOS_FINANCIEROS, ESTADOS_PAGO, METODOS_PAGO } from '../constants/index.js';

export function estadoFinanciero(precioCentavos, pagadoCentavos) {
  if (pagadoCentavos >= precioCentavos) {
    return ESTADOS_FINANCIEROS.PAGADO;
  }
  return pagadoCentavos > 0 ? ESTADOS_FINANCIEROS.PARCIAL : ESTADOS_FINANCIEROS.PENDIENTE;
}

export function construirResumen(precioCentavos, pagadoCentavos) {
  const saldoCentavos = Math.max(precioCentavos - pagadoCentavos, 0);
  return {
    precioCentavos,
    totalPagadoCentavos: pagadoCentavos,
    saldoCentavos,
    precio: fromCents(precioCentavos),
    totalPagado: fromCents(pagadoCentavos),
    saldo: fromCents(saldoCentavos),
    estadoFinanciero: estadoFinanciero(precioCentavos, pagadoCentavos)
  };
}

export async function pagadoPorCitas(citaIds) {
  if (citaIds.length === 0) {
    return new Map();
  }
  const ids = citaIds.map((id) => new mongoose.Types.ObjectId(String(id)));
  const totales = await Pago.aggregate([
    { $match: { cita: { $in: ids }, estado: ESTADOS_PAGO.REGISTRADO } },
    { $group: { _id: '$cita', total: { $sum: '$montoCentavos' }, cantidad: { $sum: 1 } } }
  ]);
  return new Map(totales.map((item) => [String(item._id), item.total]));
}

export async function resumenCita(cita) {
  const pagado = (await pagadoPorCitas([cita._id])).get(String(cita._id)) || 0;
  return construirResumen(cita.precioCentavos, pagado);
}

export async function adjuntarResumen(citas) {
  const pagados = await pagadoPorCitas(citas.map((cita) => cita._id));
  return citas.map((cita) => ({
    ...cita.toJSON(),
    finanzas: construirResumen(cita.precioCentavos, pagados.get(String(cita._id)) || 0)
  }));
}

export async function totalesPorCaja(cajaId) {
  const totales = await Pago.aggregate([
    { $match: { caja: new mongoose.Types.ObjectId(String(cajaId)) } },
    { $group: { _id: { metodo: '$metodo', estado: '$estado' }, total: { $sum: '$montoCentavos' }, cantidad: { $sum: 1 } } }
  ]);

  const porMetodo = Object.fromEntries(Object.values(METODOS_PAGO).map((metodo) => [metodo, 0]));
  let cantidadPagos = 0;
  let cantidadAnulados = 0;
  let montoAnulado = 0;

  totales.forEach(({ _id, total, cantidad }) => {
    if (_id.estado === ESTADOS_PAGO.REGISTRADO) {
      porMetodo[_id.metodo] += total;
      cantidadPagos += cantidad;
    } else {
      cantidadAnulados += cantidad;
      montoAnulado += total;
    }
  });

  return {
    efectivo: porMetodo.EFECTIVO,
    transferencia: porMetodo.TRANSFERENCIA,
    tarjeta: porMetodo.TARJETA,
    ingresos: porMetodo.EFECTIVO + porMetodo.TRANSFERENCIA + porMetodo.TARJETA,
    cantidadPagos,
    cantidadAnulados,
    montoAnulado
  };
}
