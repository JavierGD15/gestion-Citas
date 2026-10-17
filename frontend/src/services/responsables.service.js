import api, { unwrap, unwrapList } from './api';

export default {
  listar: (params) => api.get('/responsables', { params }).then(unwrapList),
  obtener: (id) => api.get(`/responsables/${id}`).then(unwrap),
  crear: (datos) => api.post('/responsables', datos).then(unwrap),
  actualizar: (id, datos) => api.put(`/responsables/${id}`, datos).then(unwrap),
  asociarPaciente: (id, paciente) => api.post(`/responsables/${id}/pacientes`, { paciente }).then(unwrap),
  desasociarPaciente: (id, pacienteId) => api.delete(`/responsables/${id}/pacientes/${pacienteId}`).then(unwrap),
  porPaciente: (pacienteId) => api.get(`/pacientes/${pacienteId}/responsables`).then(unwrap),
  buscar: (q) => api.get('/responsables', { params: { q, limit: 10 } }).then((r) => r.data.data)
};
