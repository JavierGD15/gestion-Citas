import api, { unwrap } from './api';

export default {
  contenido: () => api.get('/contenido/publico', { publico: true }).then(unwrap),
  horarios: () => api.get('/horarios', { publico: true }).then(unwrap),
  servicios: () => api.get('/servicios', { publico: true, params: { estado: 'ACTIVO' } }).then(unwrap),
  enviarContacto: (datos) => api.post('/contacto', datos, { publico: true }).then((r) => r.data)
};
