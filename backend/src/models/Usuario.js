import mongoose from 'mongoose';
import toJSONPlugin from './plugins/toJSON.js';
import { ROLES, ESTADOS } from '../constants/index.js';

const usuarioSchema = new mongoose.Schema(
  {
    nombres: { type: String, required: true, trim: true, maxlength: 80 },
    apellidos: { type: String, required: true, trim: true, maxlength: 80 },
    correo: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 120 },
    password: { type: String, required: true, select: false },
    rol: { type: String, enum: Object.values(ROLES), required: true },
    estado: { type: String, enum: Object.values(ESTADOS), default: ESTADOS.ACTIVO }
  },
  { timestamps: true, collection: 'usuarios' }
);

usuarioSchema.virtual('nombreCompleto').get(function nombreCompleto() {
  return `${this.nombres} ${this.apellidos}`;
});

usuarioSchema.plugin(toJSONPlugin);

export default mongoose.model('Usuario', usuarioSchema);
