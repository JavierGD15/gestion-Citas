import mongoose from 'mongoose';
import Cita from '../models/Cita.js';
import Caja from '../models/Caja.js';
import Contador from '../models/Contador.js';
import Pago from '../models/Pago.js';
import Paciente from '../models/Paciente.js';
import ApiError from '../utils/ApiError.js';
import { rangoDiaLocal } from '../utils/fechas.js';
import { fromCents, toCents } from '../utils/money.js';
import { buildMeta, getPagination } from '../utils/pagination.js';
import { obtenerAbierta } from './caja.service.js';
import { construirResumen, pagadoPorCitas, resumenCita } from './finanzas.service.js';
import { ESTADOS_CAJA, ESTADOS_CITA, ESTADOS_PAGO, ROLES } from '../constants/index.js';

export const POPULATE_PAGO = [
  { path: 'paciente', select: 'codigo nombres apellidos telefono' },
  {
    path: 'cita',
    select: 'codigo fecha horaInicio horaFin precioCentavos estado servicio profesional',
    populate: [
      { path: 'servicio', select: 'nombre' },
      { path: 'profesional', select: 'usuario especialidad', populate: { path: 'usuario', select: 'nombres apellidos' } }
    ]
  },
  { path: 'caja', select: 'codigo estado usuario fechaApertura fechaCierre' },
  { path: 'registradoPor', select: 'nombres apellidos rol' },
  { path: 'anuladoPor', select: 'nombres apellidos' }
];

async function generarComprobante() {
  const anio = new Date().getFullYear();
  const secuencia = await Contador.siguiente(`comprobante-${anio}`);
  return `REC-${anio}-${String(secuencia).padStart(6, '0')}`;
}

export async function registrar(datos, usuario) {
  const montoCentavos = toCents(datos.monto);
  if (!Number.isInteger(montoCentavos) || montoCentavos <= 0) {
    throw new ApiError(400, 'El monto debe ser mayor a cero');
  }

  const cita = await Cita.findById(datos.cita);
  if (!cita) {
    throw new ApiError(404, 'La cita indicada no existe');
  }
  if (cita.estado === ESTADOS_CITA.CANCELADA) {
    throw new ApiError(422, 'No pueden registrarse pagos para una cita cancelada');
  }

  const caja = await obtenerAbierta(usuario._id);
  if (!caja) {
    throw new ApiError(422, 'Debe abrir una caja antes de registrar pagos');
  }

  const resumen = await resumenCita(cita);
  if (resumen.totalPagadoCentavos + montoCentavos > cita.precioCentavos) {
    throw new ApiError(
      422,
      `El monto excede el saldo pendiente de la cita. Saldo pendiente: Q${resumen.saldo.toFixed(2)}`
    );
  }

  const reservada = await Cita.findOneAndUpdate(
    {
      _id: cita._id,
      estado: { $ne: ESTADOS_CITA.CANCELADA },
      $expr: { $lte: [{ $add: [{ $ifNull: ['$pagosRegistradosCentavos', 0] }, montoCentavos] }, '$precioCentavos'] }
    },
    { $inc: { pagosRegistradosCentavos: montoCentavos } }
  );
  if (!reservada) {
    throw new ApiError(409, 'El saldo de la cita cambió mientras se registraba el pago. Actualice e intente de nuevo');
  }

  let pago;
  try {
    const cajaVigente = await Caja.exists({ _id: caja._id, estado: ESTADOS_CAJA.ABIERTA });
    if (!cajaVigente) {
      throw new ApiError(422, 'La caja fue cerrada. No pueden registrarse pagos en cajas cerradas');
    }
    pago = await Pago.create({
      comprobante: await generarComprobante(),
      paciente: cita.paciente,
      cita: cita._id,
      caja: caja._id,
      montoCentavos,
      metodo: datos.metodo,
      referencia: datos.referencia || '',
      observaciones: datos.observaciones || '',
      registradoPor: usuario._id
    });
  } catch (error) {
    await Cita.updateOne({ _id: cita._id }, { $inc: { pagosRegistradosCentavos: -montoCentavos } });
    throw error;
  }

  return { pago: await obtener(pago._id), resumen: await resumenCita(cita) };
}

export async function anular(id, motivo, usuario) {
  const pago = await Pago.findById(id).populate('caja', 'estado usuario codigo');
  if (!pago) {
    throw new ApiError(404, 'Pago no encontrado');
  }
  if (pago.estado === ESTADOS_PAGO.ANULADO) {
    throw new ApiError(422, 'El pago ya se encuentra anulado');
  }
  if (pago.caja.estado !== ESTADOS_CAJA.ABIERTA) {
    throw new ApiError(422, 'Solo pueden anularse pagos de cajas abiertas. Los pagos de cajas cerradas están bloqueados');
  }
  if (usuario.rol !== ROLES.ADMINISTRADOR && !pago.caja.usuario.equals(usuario._id)) {
    throw new ApiError(403, 'Solo puede anular pagos registrados en su propia caja');
  }

  const anulado = await Pago.findOneAndUpdate(
    { _id: pago._id, estado: ESTADOS_PAGO.REGISTRADO },
    { estado: ESTADOS_PAGO.ANULADO, motivoAnulacion: motivo, anuladoPor: usuario._id, fechaAnulacion: new Date() },
    { new: true }
  );
  if (!anulado) {
    throw new ApiError(409, 'El pago ya fue anulado por otro usuario');
  }

  await Cita.updateOne({ _id: pago.cita }, { $inc: { pagosRegistradosCentavos: -pago.montoCentavos } });

  const cita = await Cita.findById(pago.cita);
  return { pago: await obtener(pago._id), resumen: await resumenCita(cita) };
}

export async function construirFiltro(query) {
  const filtro = {};
  ['paciente', 'cita', 'caja', 'metodo', 'estado', 'registradoPor'].forEach((campo) => {
    if (query[campo]) {
      filtro[campo] = query[campo];
    }
  });
  if (query.comprobante) {
    filtro.comprobante = String(query.comprobante).trim().toUpperCase();
  }
  if (query.fecha) {
    const { inicio, fin } = rangoDiaLocal(query.fecha);
    filtro.fechaPago = { $gte: inicio, $lt: fin };
  } else if (query.desde || query.hasta) {
    filtro.fechaPago = {};
    if (query.desde) {
      filtro.fechaPago.$gte = rangoDiaLocal(query.desde).inicio;
    }
    if (query.hasta) {
      filtro.fechaPago.$lt = rangoDiaLocal(query.hasta).fin;
    }
  }
  return filtro;
}

export async function listar(query) {
  const filtro = await construirFiltro(query);
  const paginacion = getPagination(query);
  const [data, total, sumas] = await Promise.all([
    Pago.find(filtro).populate(POPULATE_PAGO).sort({ fechaPago: -1 }).skip(paginacion.skip).limit(paginacion.limit),
    Pago.countDocuments(filtro),
    Pago.aggregate([
      { $match: { ...filtro, estado: ESTADOS_PAGO.REGISTRADO } },
      { $group: { _id: '$metodo', total: { $sum: '$montoCentavos' } } }
    ])
  ]);
  const porMetodo = Object.fromEntries(sumas.map((item) => [item._id, fromCents(item.total)]));
  const totalValido = fromCents(sumas.reduce((acc, item) => acc + item.total, 0));
  return { data, meta: buildMeta(paginacion, total), totales: { porMetodo, totalValido } };
}

export async function obtener(id) {
  const pago = await Pago.findById(id).populate(POPULATE_PAGO);
  if (!pago) {
    throw new ApiError(404, 'Pago no encontrado');
  }
  return pago;
}

export async function obtenerPorComprobante(numero) {
  const pago = await Pago.findOne({ comprobante: String(numero).trim().toUpperCase() }).populate(POPULATE_PAGO);
  if (!pago) {
    throw new ApiError(404, 'Comprobante no encontrado');
  }
  return pago;
}

export async function pagosDeCita(citaId) {
  const cita = await Cita.findById(citaId);
  if (!cita) {
    throw new ApiError(404, 'Cita no encontrada');
  }
  const pagos = await Pago.find({ cita: cita._id }).populate(POPULATE_PAGO.slice(2)).sort({ fechaPago: 1 });
  return { resumen: await resumenCita(cita), pagos };
}

export async function saldoCita(citaId) {
  const cita = await Cita.findById(citaId);
  if (!cita) {
    throw new ApiError(404, 'Cita no encontrada');
  }
  return { cita: { _id: cita._id, codigo: cita.codigo, estado: cita.estado }, ...(await resumenCita(cita)) };
}

export async function pagosDePaciente(pacienteId) {
  if (!(await Paciente.exists({ _id: pacienteId }))) {
    throw new ApiError(404, 'Paciente no encontrado');
  }
  const [pagos, citas] = await Promise.all([
    Pago.find({ paciente: pacienteId }).populate(POPULATE_PAGO).sort({ fechaPago: -1 }),
    Cita.find({ paciente: pacienteId, estado: { $ne: ESTADOS_CITA.CANCELADA } }).select('precioCentavos')
  ]);
  const pagados = await pagadoPorCitas(citas.map((cita) => cita._id));
  const precioTotal = citas.reduce((acc, cita) => acc + cita.precioCentavos, 0);
  const pagadoTotal = citas.reduce((acc, cita) => acc + (pagados.get(String(cita._id)) || 0), 0);
  return { resumen: construirResumen(precioTotal, pagadoTotal), pagos };
}

export async function saldosPendientes(query) {
  const paginacion = getPagination(query);
  const match = { estado: { $ne: ESTADOS_CITA.CANCELADA }, precioCentavos: { $gt: 0 } };
  if (query.paciente) {
    match.paciente = new mongoose.Types.ObjectId(String(query.paciente));
  }
  const [resultado] = await Cita.aggregate([
    { $match: match },
    {
      $lookup: {
        from: 'pagos',
        let: { citaId: '$_id' },
        pipeline: [
          { $match: { $expr: { $and: [{ $eq: ['$cita', '$$citaId'] }, { $eq: ['$estado', ESTADOS_PAGO.REGISTRADO] }] } } },
          { $group: { _id: null, total: { $sum: '$montoCentavos' } } }
        ],
        as: 'pagos'
      }
    },
    { $addFields: { pagadoCentavos: { $ifNull: [{ $first: '$pagos.total' }, 0] } } },
    { $addFields: { saldoCentavos: { $subtract: ['$precioCentavos', '$pagadoCentavos'] } } },
    { $match: { saldoCentavos: { $gt: 0 } } },
    { $sort: { fecha: 1, horaInicio: 1 } },
    {
      $facet: {
        data: [{ $skip: paginacion.skip }, { $limit: paginacion.limit }, { $project: { pagos: 0, historial: 0 } }],
        total: [{ $count: 'cantidad' }],
        suma: [{ $group: { _id: null, saldo: { $sum: '$saldoCentavos' } } }]
      }
    }
  ]);

  const citas = await Cita.populate(resultado.data, [
    { path: 'paciente', select: 'codigo nombres apellidos telefono' },
    { path: 'servicio', select: 'nombre' }
  ]);

  return {
    data: citas.map((cita) => ({
      _id: cita._id,
      codigo: cita.codigo,
      fecha: cita.fecha,
      horaInicio: cita.horaInicio,
      estado: cita.estado,
      paciente: cita.paciente,
      servicio: cita.servicio,
      ...construirResumen(cita.precioCentavos, cita.pagadoCentavos)
    })),
    meta: buildMeta(paginacion, resultado.total[0]?.cantidad || 0),
    totales: { saldoPendiente: fromCents(resultado.suma[0]?.saldo || 0) }
  };
}

export async function tienePagosValidos(citaId) {
  return Boolean(await Pago.exists({ cita: citaId, estado: ESTADOS_PAGO.REGISTRADO }));
}
