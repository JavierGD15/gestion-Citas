import mongoose from 'mongoose';
import toJSONPlugin from './plugins/toJSON.js';
import { ESTADOS } from '../constants/index.js';

const profesionalSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true, unique: true },
    especialidad: { type: String, required: true, trim: true, maxlength: 120 },
    colegiado: { type: String, trim: true, maxlength: 30, default: '' },
    telefono: { type: String, required: true, trim: true, maxlength: 20 },
    descripcion: { type: String, trim: true, maxlength: 1000, default: '' },
    fotografia: { type: String, trim: true, default: '' },
    estado: { type: String, enum: Object.values(ESTADOS), default: ESTADOS.ACTIVO }
  },
  { timestamps: true, collection: 'profesionales' }
);

profesionalSchema.virtual('nombreCompleto').get(function nombreCompleto() {
  return this.usuario?.nombres ? `${this.usuario.nombres} ${this.usuario.apellidos}` : '';
});

profesionalSchema.plugin(toJSONPlugin);

export default mongoose.model('Profesional', profesionalSchema);
