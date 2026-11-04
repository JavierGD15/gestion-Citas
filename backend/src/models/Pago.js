import mongoose from 'mongoose';
import toJSONPlugin from './plugins/toJSON.js';
import { ESTADOS_PAGO, METODOS_PAGO } from '../constants/index.js';
import { fromCents } from '../utils/money.js';

const pagoSchema = new mongoose.Schema(
  {
    comprobante: { type: String, required: true, unique: true, immutable: true },
    paciente: { type: mongoose.Schema.Types.ObjectId, ref: 'Paciente', required: true, immutable: true },
    cita: { type: mongoose.Schema.Types.ObjectId, ref: 'Cita', required: true, immutable: true },
    caja: { type: mongoose.Schema.Types.ObjectId, ref: 'Caja', required: true, immutable: true },
    montoCentavos: {
      type: Number,
      required: true,
      min: 1,
      immutable: true,
      validate: { validator: Number.isInteger, message: 'El monto debe expresarse en centavos enteros' }
    },
    metodo: { type: String, enum: Object.values(METODOS_PAGO), required: true, immutable: true },
    referencia: { type: String, trim: true, maxlength: 60, default: '' },
    observaciones: { type: String, trim: true, maxlength: 500, default: '' },
    fechaPago: { type: Date, default: Date.now, immutable: true },
    registradoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true, immutable: true },
    estado: { type: String, enum: Object.values(ESTADOS_PAGO), default: ESTADOS_PAGO.REGISTRADO },
    motivoAnulacion: { type: String, trim: true, maxlength: 500, default: '' },
    anuladoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', default: null },
    fechaAnulacion: { type: Date, default: null }
  },
  { timestamps: true, collection: 'pagos' }
);

pagoSchema.index({ cita: 1, estado: 1 });
pagoSchema.index({ caja: 1, estado: 1 });
pagoSchema.index({ paciente: 1, fechaPago: -1 });
pagoSchema.index({ fechaPago: -1 });

pagoSchema.virtual('monto').get(function monto() {
  return fromCents(this.montoCentavos);
});

pagoSchema.pre(['deleteOne', 'deleteMany', 'findOneAndDelete'], function bloquearEliminacion() {
  throw new Error('Los pagos no pueden eliminarse físicamente');
});

pagoSchema.plugin(toJSONPlugin);

export default mongoose.model('Pago', pagoSchema);
