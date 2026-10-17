import mongoose from 'mongoose';
import toJSONPlugin from './plugins/toJSON.js';
import { ESTADOS } from '../constants/index.js';

const asignacionMaterialSchema = new mongoose.Schema(
  {
    material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
    paciente: { type: mongoose.Schema.Types.ObjectId, ref: 'Paciente', required: true },
    asignadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    indicaciones: { type: String, trim: true, maxlength: 1000, default: '' },
    fechaAsignacion: { type: Date, default: Date.now },
    estado: { type: String, enum: Object.values(ESTADOS), default: ESTADOS.ACTIVO },
    retiradoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', default: null },
    fechaRetiro: { type: Date, default: null }
  },
  { timestamps: true, collection: 'asignacionesMateriales' }
);

asignacionMaterialSchema.index(
  { material: 1, paciente: 1 },
  { unique: true, partialFilterExpression: { estado: ESTADOS.ACTIVO } }
);

asignacionMaterialSchema.plugin(toJSONPlugin);

export default mongoose.model('AsignacionMaterial', asignacionMaterialSchema);
