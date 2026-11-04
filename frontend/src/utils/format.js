const moneda = new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ', minimumFractionDigits: 2 });
const TIME_ZONE = 'America/Guatemala';

export function formatearMoneda(valor) {
  return moneda.format(Number(valor) || 0);
}

export function formatearFecha(valor) {
  if (!valor) {
    return '';
  }
  const fecha = typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor) ? new Date(`${valor}T12:00:00-06:00`) : new Date(valor);
  return fecha.toLocaleDateString('es-GT', { timeZone: TIME_ZONE, day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatearFechaLarga(valor) {
  if (!valor) {
    return '';
  }
  const fecha = typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor) ? new Date(`${valor}T12:00:00-06:00`) : new Date(valor);
  return fecha.toLocaleDateString('es-GT', { timeZone: TIME_ZONE, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatearFechaHora(valor) {
  if (!valor) {
    return '';
  }
  return new Date(valor).toLocaleString('es-GT', {
    timeZone: TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function fechaISO(valor = new Date()) {
  const partes = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(valor));
  return partes;
}

export function aMonto(valor) {
  return Number(Number(valor).toFixed(2));
}
