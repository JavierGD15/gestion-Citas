import mongoose from 'mongoose';
import toJSONPlugin from './plugins/toJSON.js';
import { ESTADOS, TIPOS_MATERIAL } from '../constants/index.js';

const materialSchema = new mongoose.Schema(
  {
    codigo: { type: String, required: true, unique: true },
    titulo: { type: String, required: true, trim: true, maxlength: 150 },
    descripcion: { type: String, required: true, trim: true, maxlength: 2000 },
    tipo: { type: String, enum: Object.values(TIPOS_MATERIAL), required: true },
    enlace: { type: String, required: true, trim: true, maxlength: 500 },
    fechaRegistro: { type: Date, default: Date.now, immutable: true },
    estado: { type: String, enum: Object.values(ESTADOS), default: ESTADOS.ACTIVO },
    registradoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }
  },
  { timestamps: true, collection: 'materiales' }
);

materialSchema.plugin(toJSONPlugin);

export default mongoose.model('Material', materialSchema);
