const moneda = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const TIME_ZONE = 'America/Guatemala';

// Formato Q1,000.00 / -Q10.00
export function formatearMoneda(valor) {
  const numero = Number(valor) || 0;
  return `${numero < 0 ? '-' : ''}Q${moneda.format(Math.abs(numero))}`;
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
