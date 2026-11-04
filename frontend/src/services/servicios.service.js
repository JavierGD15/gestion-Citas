import api, { unwrap } from './api';

export default {
  listar: (params) => api.get('/servicios', { params }).then(unwrap),
  obtener: (id) => api.get(`/servicios/${id}`).then(unwrap),
  crear: (datos) => api.post('/servicios', datos).then(unwrap),
  actualizar: (id, datos) => api.put(`/servicios/${id}`, datos).then(unwrap),
  cambiarEstado: (id, estado) => api.patch(`/servicios/${id}/estado`, { estado }).then(unwrap)
};
