import api, { unwrap, unwrapList } from './api';

export default {
  listar: (params) => api.get('/pacientes', { params }).then(unwrapList),
  obtener: (id) => api.get(`/pacientes/${id}`).then(unwrap),
  crear: (datos) => api.post('/pacientes', datos).then(unwrap),
  actualizar: (id, datos) => api.put(`/pacientes/${id}`, datos).then(unwrap),
  cambiarEstado: (id, estado) => api.patch(`/pacientes/${id}/estado`, { estado }).then(unwrap)
};
