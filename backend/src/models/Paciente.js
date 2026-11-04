import mongoose from 'mongoose';
import toJSONPlugin from './plugins/toJSON.js';
import { ESTADOS, MAYORIA_EDAD, SEXOS } from '../constants/index.js';
import { calcularEdad } from '../utils/fechas.js';

const pacienteSchema = new mongoose.Schema(
  {
    codigo: { type: String, required: true, unique: true },
    fotografia: { type: String, trim: true, default: '' },
    nombres: { type: String, required: true, trim: true, maxlength: 80 },
    apellidos: { type: String, required: true, trim: true, maxlength: 80 },
    fechaNacimiento: { type: Date, required: true },
    sexo: { type: String, enum: Object.values(SEXOS), required: true },
    telefono: { type: String, required: true, trim: true, maxlength: 20 },
    direccion: { type: String, required: true, trim: true, maxlength: 250 },
    fechaInicioProceso: { type: Date, required: true },
    observaciones: { type: String, trim: true, maxlength: 2000, default: '' },
    estado: { type: String, enum: Object.values(ESTADOS), default: ESTADOS.ACTIVO },
    registradoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }
  },
  { timestamps: true, collection: 'pacientes' }
);

pacienteSchema.index({ nombres: 1, apellidos: 1 });

pacienteSchema.virtual('nombreCompleto').get(function nombreCompleto() {
  return `${this.nombres} ${this.apellidos}`;
});

pacienteSchema.virtual('edad').get(function edad() {
  return calcularEdad(this.fechaNacimiento);
});

pacienteSchema.virtual('esMenor').get(function esMenor() {
  const edad = calcularEdad(this.fechaNacimiento);
  return edad !== null && edad < MAYORIA_EDAD;
});

pacienteSchema.plugin(toJSONPlugin);

export default mongoose.model('Paciente', pacienteSchema);
