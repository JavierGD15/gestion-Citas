export function mensajeError(error, porDefecto = 'Ocurrió un error inesperado') {
  if (!error?.response) {
    return 'No fue posible conectar con el servidor';
  }
  const { message, details } = error.response.data || {};
  if (Array.isArray(details) && details.length > 0) {
    return `${message || porDefecto}: ${details.map((d) => d.mensaje).join('. ')}`;
  }
  return message || porDefecto;
}

export function erroresPorCampo(error) {
  const details = error?.response?.data?.details;
  if (!Array.isArray(details)) {
    return {};
  }
  return details.reduce((acc, detalle) => {
    if (detalle.campo && !acc[detalle.campo]) {
      acc[detalle.campo] = detalle.mensaje;
    }
    return acc;
  }, {});
}
