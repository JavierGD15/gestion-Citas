import mongoose from 'mongoose';
import toJSONPlugin from './plugins/toJSON.js';
import { ESTADOS } from '../constants/index.js';
import { fromCents } from '../utils/money.js';

const servicioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, unique: true, trim: true, maxlength: 120 },
    descripcion: { type: String, required: true, trim: true, maxlength: 2000 },
    duracionMinutos: { type: Number, required: true, min: 5, max: 480 },
    precioCentavos: {
      type: Number,
      required: true,
      min: 0,
      validate: { validator: Number.isInteger, message: 'El precio debe expresarse en centavos enteros' }
    },
    imagen: { type: String, trim: true, default: '' },
    estado: { type: String, enum: Object.values(ESTADOS), default: ESTADOS.ACTIVO }
  },
  { timestamps: true, collection: 'servicios' }
);

servicioSchema.virtual('precio').get(function precio() {
  return fromCents(this.precioCentavos);
});

servicioSchema.plugin(toJSONPlugin);

export default mongoose.model('Servicio', servicioSchema);
