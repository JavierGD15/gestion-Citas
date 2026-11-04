import mongoose from 'mongoose';
import toJSONPlugin from './plugins/toJSON.js';
import { ESTADOS_CITA, HORA_REGEX } from '../constants/index.js';
import { fromCents } from '../utils/money.js';

const historialSchema = new mongoose.Schema(
  {
    accion: { type: String, required: true },
    estado: { type: String, enum: Object.values(ESTADOS_CITA) },
    detalle: { type: String, default: '' },
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    fecha: { type: Date, default: Date.now }
  },
  { _id: false }
);

const citaSchema = new mongoose.Schema(
  {
    codigo: { type: String, required: true, unique: true },
    paciente: { type: mongoose.Schema.Types.ObjectId, ref: 'Paciente', required: true },
    servicio: { type: mongoose.Schema.Types.ObjectId, ref: 'Servicio', required: true },
    profesional: { type: mongoose.Schema.Types.ObjectId, ref: 'Profesional', required: true },
    fecha: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    horaInicio: { type: String, required: true, match: HORA_REGEX },
    horaFin: { type: String, required: true, match: HORA_REGEX },
    inicio: { type: Date, required: true },
    fin: { type: Date, required: true },
    duracionMinutos: { type: Number, required: true, min: 1 },
    precioCentavos: {
      type: Number,
      required: true,
      min: 0,
      immutable: true,
      validate: { validator: Number.isInteger, message: 'El precio debe expresarse en centavos enteros' }
    },
    estado: { type: String, enum: Object.values(ESTADOS_CITA), default: ESTADOS_CITA.PENDIENTE },
    pagosRegistradosCentavos: { type: Number, default: 0, min: 0, select: false },
    observaciones: { type: String, trim: true, maxlength: 2000, default: '' },
    motivoCancelacion: { type: String, trim: true, maxlength: 500, default: '' },
    solicitud: { type: mongoose.Schema.Types.ObjectId, ref: 'SolicitudCita', default: null },
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    historial: { type: [historialSchema], default: [] }
  },
  { timestamps: true, collection: 'citas' }
);

citaSchema.index({ profesional: 1, inicio: 1, fin: 1 });
citaSchema.index({ paciente: 1, inicio: -1 });
citaSchema.index({ fecha: 1 });

citaSchema.virtual('precio').get(function precio() {
  return fromCents(this.precioCentavos);
});

citaSchema.plugin(toJSONPlugin);

export default mongoose.model('Cita', citaSchema);
