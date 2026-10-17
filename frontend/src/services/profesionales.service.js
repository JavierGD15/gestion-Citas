import api, { unwrap } from './api';

export default {
  listar: (params) => api.get('/profesionales', { params }).then(unwrap),
  obtener: (id) => api.get(`/profesionales/${id}`).then(unwrap),
  miPerfil: () => api.get('/profesionales/me').then(unwrap),
  crear: (datos) => api.post('/profesionales', datos).then(unwrap),
  actualizar: (id, datos) => api.put(`/profesionales/${id}`, datos).then(unwrap),
  cambiarEstado: (id, estado) => api.patch(`/profesionales/${id}/estado`, { estado }).then(unwrap)
};
