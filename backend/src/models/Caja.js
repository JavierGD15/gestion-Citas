import mongoose from 'mongoose';
import toJSONPlugin from './plugins/toJSON.js';
import { ESTADOS_CAJA } from '../constants/index.js';
import { fromCents } from '../utils/money.js';

const centavos = (requerido = false) => ({
  type: Number,
  required: requerido,
  default: requerido ? undefined : null,
  validate: { validator: (valor) => valor === null || Number.isInteger(valor), message: 'Los montos deben expresarse en centavos enteros' }
});

const cajaSchema = new mongoose.Schema(
  {
    codigo: { type: String, required: true, unique: true },
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    fechaApertura: { type: Date, default: Date.now, immutable: true },
    montoInicialCentavos: { ...centavos(true), min: 0, immutable: true },
    observacionesApertura: { type: String, trim: true, maxlength: 500, default: '' },
    estado: { type: String, enum: Object.values(ESTADOS_CAJA), default: ESTADOS_CAJA.ABIERTA },
    totalEfectivoCentavos: centavos(),
    totalTransferenciaCentavos: centavos(),
    totalTarjetaCentavos: centavos(),
    totalIngresosCentavos: centavos(),
    efectivoEsperadoCentavos: centavos(),
    efectivoContadoCentavos: centavos(),
    diferenciaCentavos: centavos(),
    cantidadPagos: { type: Number, default: null },
    cantidadAnulados: { type: Number, default: null },
    fechaCierre: { type: Date, default: null },
    cerradoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', default: null },
    observacionesCierre: { type: String, trim: true, maxlength: 500, default: '' }
  },
  { timestamps: true, collection: 'cajas' }
);

cajaSchema.index({ usuario: 1 }, { unique: true, partialFilterExpression: { estado: ESTADOS_CAJA.ABIERTA } });
cajaSchema.index({ fechaApertura: -1 });

const VIRTUALES = {
  montoInicial: 'montoInicialCentavos',
  totalEfectivo: 'totalEfectivoCentavos',
  totalTransferencia: 'totalTransferenciaCentavos',
  totalTarjeta: 'totalTarjetaCentavos',
  totalIngresos: 'totalIngresosCentavos',
  efectivoEsperado: 'efectivoEsperadoCentavos',
  efectivoContado: 'efectivoContadoCentavos',
  diferencia: 'diferenciaCentavos'
};

Object.entries(VIRTUALES).forEach(([virtual, campo]) => {
  cajaSchema.virtual(virtual).get(function obtener() {
    return this[campo] === null || this[campo] === undefined ? null : fromCents(this[campo]);
  });
});

cajaSchema.plugin(toJSONPlugin);

export default mongoose.model('Caja', cajaSchema);
