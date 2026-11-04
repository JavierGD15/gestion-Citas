import env from '../config/env.js';

const FECHA_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function offsetMinutos() {
  const [, signo, horas, minutos] = env.tzOffset.match(/^([+-])(\d{2}):(\d{2})$/) || [null, '-', '06', '00'];
  const total = Number(horas) * 60 + Number(minutos);
  return signo === '-' ? -total : total;
}

export function esFechaValida(valor) {
  if (!FECHA_REGEX.test(String(valor))) {
    return false;
  }
  const fecha = new Date(`${valor}T12:00:00.000Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor;
}

export function fechaSoloDia(valor) {
  return new Date(`${valor}T12:00:00.000Z`);
}

export function aISODia(fecha) {
  return new Date(fecha).toISOString().slice(0, 10);
}

export function aISODiaLocal(fecha) {
  return new Date(new Date(fecha).getTime() + offsetMinutos() * 60000).toISOString().slice(0, 10);
}

export function horaLocal(fecha) {
  return new Date(new Date(fecha).getTime() + offsetMinutos() * 60000).toISOString().slice(11, 16);
}

export function hoyISO() {
  return aISODiaLocal(new Date());
}

export function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) {
    return null;
  }
  const hoy = hoyISO();
  const nacimiento = aISODia(fechaNacimiento);
  let edad = Number(hoy.slice(0, 4)) - Number(nacimiento.slice(0, 4));
  if (hoy.slice(5) < nacimiento.slice(5)) {
    edad -= 1;
  }
  return edad;
}

export function combinarFechaHora(fecha, hora) {
  return new Date(`${fecha}T${hora}:00${env.tzOffset}`);
}

export function diaSemana(fecha) {
  return new Date(`${fecha}T12:00:00.000Z`).getUTCDay();
}

export function sumarMinutos(hora, minutos) {
  const [h, m] = hora.split(':').map(Number);
  const total = h * 60 + m + minutos;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export function rangoDiaLocal(fecha) {
  return { inicio: combinarFechaHora(fecha, '00:00'), fin: new Date(combinarFechaHora(fecha, '00:00').getTime() + 86400000) };
}
