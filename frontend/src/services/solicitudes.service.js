import api, { unwrap, unwrapList } from './api';

export default {
  crear: (datos) => api.post('/solicitudes-cita', datos).then((r) => r.data),
  listar: (params) => api.get('/solicitudes-cita', { params }).then(unwrapList),
  obtener: (id) => api.get(`/solicitudes-cita/${id}`).then(unwrap),
  rechazar: (id, motivo) => api.patch(`/solicitudes-cita/${id}/rechazar`, { motivo }).then(unwrap)
};
