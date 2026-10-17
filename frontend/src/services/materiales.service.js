import api, { unwrap, unwrapList } from './api';

export default {
  listar: (params) => api.get('/materiales', { params }).then(unwrapList),
  obtener: (id) => api.get(`/materiales/${id}`).then(unwrap),
  crear: (datos) => api.post('/materiales', datos).then(unwrap),
  actualizar: (id, datos) => api.put(`/materiales/${id}`, datos).then(unwrap),
  cambiarEstado: (id, estado) => api.patch(`/materiales/${id}/estado`, { estado }).then(unwrap),
  asignar: (id, datos) => api.post(`/materiales/${id}/asignaciones`, datos).then(unwrap),
  asignaciones: (id) => api.get(`/materiales/${id}/asignaciones`).then(unwrap),
  porPaciente: (pacienteId) => api.get(`/pacientes/${pacienteId}/materiales`).then(unwrap),
  retirar: (asignacionId) => api.patch(`/materiales/asignaciones/${asignacionId}/retirar`).then(unwrap),
  buscarActivos: (q) => api.get('/materiales', { params: { q, estado: 'ACTIVO', limit: 10 } }).then((r) => r.data.data)
};
