import Horario from '../models/Horario.js';

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
