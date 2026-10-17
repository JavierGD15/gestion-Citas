import mongoose from 'mongoose';
import toJSONPlugin from './plugins/toJSON.js';
import { DIAS_SEMANA, HORA_REGEX } from '../constants/index.js';

const horarioSchema = new mongoose.Schema(
  {
    diaSemana: { type: Number, required: true, unique: true, min: 0, max: 6 },
    activo: { type: Boolean, default: true },
    horaInicio: { type: String, required: true, match: HORA_REGEX },
    horaFin: {
      type: String,
      required: true,
      match: HORA_REGEX,
      validate: {
        validator(value) {
          return !this.horaInicio || value > this.horaInicio;
        },
        message: 'La hora de finalización debe ser posterior a la hora de inicio'
      }
    }
  },
  { timestamps: true, collection: 'horarios' }
);

horarioSchema.virtual('nombreDia').get(function nombreDia() {
  return DIAS_SEMANA[this.diaSemana];
});

horarioSchema.plugin(toJSONPlugin);

export default mongoose.model('Horario', horarioSchema);
