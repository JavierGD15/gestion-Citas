import api, { unwrap, unwrapList } from './api';

export default {
  listarAdmin: (params) => api.get('/contenido/admin', { params }).then(unwrap),
  crear: (datos) => api.post('/contenido', datos).then(unwrap),
  actualizar: (id, datos) => api.put(`/contenido/${id}`, datos).then(unwrap),
  cambiarEstado: (id, estado) => api.patch(`/contenido/${id}/estado`, { estado }).then(unwrap),
  horarios: () => api.get('/horarios').then(unwrap),
  actualizarHorarios: (horarios) => api.put('/horarios', { horarios }).then(unwrap),
  mensajes: (params) => api.get('/contacto', { params }).then(unwrapList),
  marcarLeido: (id) => api.patch(`/contacto/${id}/leido`).then(unwrap)
};
