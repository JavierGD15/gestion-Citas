import api, { unwrap, unwrapList } from './api';

export default {
  listar: (params) => api.get('/citas', { params }).then(unwrapList),
  calendario: (params) => api.get('/citas/calendario', { params }).then(unwrap),
  disponibilidad: (params) => api.get('/citas/disponibilidad', { params }).then(unwrap),
  obtener: (id) => api.get(`/citas/${id}`).then(unwrap),
  crear: (datos) => api.post('/citas', datos).then(unwrap),
  actualizar: (id, datos) => api.put(`/citas/${id}`, datos).then(unwrap),
  cambiarEstado: (id, estado, motivo) => api.patch(`/citas/${id}/estado`, { estado, motivo }).then(unwrap),
  porPaciente: (pacienteId) => api.get(`/pacientes/${pacienteId}/citas`).then(unwrap)
};
