import mongoose from 'mongoose';
import toJSONPlugin from './plugins/toJSON.js';
import { ESTADOS, TIPOS_CONTENIDO, CATEGORIAS_CORPORATIVO } from '../constants/index.js';

const contenidoSchema = new mongoose.Schema(
  {
    tipo: { type: String, enum: Object.values(TIPOS_CONTENIDO), required: true },
    clave: { type: String, trim: true, lowercase: true },
    titulo: { type: String, trim: true, maxlength: 200, default: '' },
    descripcion: { type: String, trim: true, maxlength: 5000, default: '' },
    imagen: { type: String, trim: true, default: '' },
    imagenes: { type: [String], default: [] },
    enlace: { type: String, trim: true, default: '' },
    categoria: { type: String, enum: [...Object.values(CATEGORIAS_CORPORATIVO), null], default: null },
    fechaPublicacion: { type: Date },
    datos: { type: mongoose.Schema.Types.Mixed, default: {} },
    orden: { type: Number, default: 0 },
    estado: { type: String, enum: Object.values(ESTADOS), default: ESTADOS.ACTIVO },
    actualizadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }
  },
  { timestamps: true, collection: 'contenidoInstitucional', minimize: false }
);

contenidoSchema.index({ clave: 1 }, { unique: true, partialFilterExpression: { clave: { $type: 'string' } } });
contenidoSchema.index({ tipo: 1, orden: 1 });

contenidoSchema.plugin(toJSONPlugin);

export default mongoose.model('ContenidoInstitucional', contenidoSchema);
