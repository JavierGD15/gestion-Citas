import api, { unwrap } from './api';

export default {
  contenido: () => api.get('/contenido/publico').then(unwrap),
  horarios: () => api.get('/horarios').then(unwrap),
  servicios: () => api.get('/servicios').then(unwrap),
  enviarContacto: (datos) => api.post('/contacto', datos).then((r) => r.data)
};
