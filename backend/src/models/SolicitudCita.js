import mongoose from 'mongoose';
import toJSONPlugin from './plugins/toJSON.js';
import { ESTADOS_SOLICITUD } from '../constants/index.js';

const solicitudCitaSchema = new mongoose.Schema(
  {
    nombreSolicitante: { type: String, required: true, trim: true, maxlength: 120 },
    correo: { type: String, required: true, trim: true, lowercase: true, maxlength: 120 },
    telefono: { type: String, required: true, trim: true, maxlength: 20 },
    servicio: { type: mongoose.Schema.Types.ObjectId, ref: 'Servicio', required: true },
    fechaPreferida: { type: Date, required: true },
    mensaje: { type: String, trim: true, maxlength: 1000, default: '' },
    estado: { type: String, enum: Object.values(ESTADOS_SOLICITUD), default: ESTADOS_SOLICITUD.PENDIENTE },
    cita: { type: mongoose.Schema.Types.ObjectId, ref: 'Cita', default: null },
    atendidaPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', default: null },
    fechaAtencion: { type: Date, default: null },
    motivoRechazo: { type: String, trim: true, maxlength: 500, default: '' }
  },
  { timestamps: true, collection: 'solicitudesCita' }
);

solicitudCitaSchema.index({ estado: 1, createdAt: -1 });

solicitudCitaSchema.plugin(toJSONPlugin);

export default mongoose.model('SolicitudCita', solicitudCitaSchema);
