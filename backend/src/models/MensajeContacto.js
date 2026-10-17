import mongoose from 'mongoose';
import toJSONPlugin from './plugins/toJSON.js';

const mensajeContactoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true, maxlength: 120 },
    correo: { type: String, required: true, trim: true, lowercase: true, maxlength: 120 },
    telefono: { type: String, required: true, trim: true, maxlength: 20 },
    asunto: { type: String, required: true, trim: true, maxlength: 150 },
    mensaje: { type: String, required: true, trim: true, maxlength: 2000 },
    leido: { type: Boolean, default: false },
    leidoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    fechaLectura: { type: Date }
  },
  { timestamps: true, collection: 'mensajesContacto' }
);

mensajeContactoSchema.plugin(toJSONPlugin);

export default mongoose.model('MensajeContacto', mensajeContactoSchema);
