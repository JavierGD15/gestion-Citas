import mongoose from 'mongoose';
import toJSONPlugin from './plugins/toJSON.js';

const responsableSchema = new mongoose.Schema(
  {
    codigo: { type: String, required: true, unique: true },
    fotografia: { type: String, trim: true, default: '' },
    nombres: { type: String, required: true, trim: true, maxlength: 80 },
    apellidos: { type: String, required: true, trim: true, maxlength: 80 },
    parentesco: { type: String, required: true, trim: true, maxlength: 50 },
    telefono: { type: String, required: true, trim: true, maxlength: 20 },
    correo: { type: String, required: true, trim: true, lowercase: true, maxlength: 120 },
    direccion: { type: String, required: true, trim: true, maxlength: 250 },
    pacientes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Paciente' }],
    registradoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }
  },
  { timestamps: true, collection: 'responsables' }
);

responsableSchema.index({ pacientes: 1 });

responsableSchema.virtual('nombreCompleto').get(function nombreCompleto() {
  return `${this.nombres} ${this.apellidos}`;
});

responsableSchema.plugin(toJSONPlugin);

export default mongoose.model('Responsable', responsableSchema);
