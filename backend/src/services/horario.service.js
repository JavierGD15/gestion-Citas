import Horario from '../models/Horario.js';
import ApiError from '../utils/ApiError.js';
import { DIAS_SEMANA } from '../constants/index.js';

const HORARIOS_BASE = [
  { diaSemana: 0, activo: false, horaInicio: '08:00', horaFin: '12:00' },
  { diaSemana: 1, activo: true, horaInicio: '08:00', horaFin: '17:00' },
  { diaSemana: 2, activo: true, horaInicio: '08:00', horaFin: '17:00' },
  { diaSemana: 3, activo: true, horaInicio: '08:00', horaFin: '17:00' },
  { diaSemana: 4, activo: true, horaInicio: '08:00', horaFin: '17:00' },
  { diaSemana: 5, activo: true, horaInicio: '08:00', horaFin: '17:00' },
  { diaSemana: 6, activo: true, horaInicio: '08:00', horaFin: '12:00' }
];

export async function asegurarHorariosBase() {
  await Promise.all(
    HORARIOS_BASE.map((horario) =>
      Horario.updateOne({ diaSemana: horario.diaSemana }, { $setOnInsert: horario }, { upsert: true })
    )
  );
}

export async function listar() {
  return Horario.find().sort({ diaSemana: 1 });
}

export async function actualizar(horarios) {
  const dias = new Set(horarios.map((horario) => horario.diaSemana));
  if (dias.size !== horarios.length) {
    throw new ApiError(400, 'Hay días repetidos en la configuración de horarios');
  }
  for (const horario of horarios) {
    if (horario.horaInicio >= horario.horaFin) {
      throw new ApiError(400, `En ${DIAS_SEMANA[horario.diaSemana]} la hora de fin debe ser posterior a la de inicio`);
    }
  }
  await Promise.all(
    horarios.map(({ diaSemana, activo, horaInicio, horaFin }) =>
      Horario.updateOne({ diaSemana }, { $set: { activo, horaInicio, horaFin } }, { upsert: true, runValidators: true })
    )
  );
  return listar();
}
