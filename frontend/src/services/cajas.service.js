import api, { unwrap, unwrapList } from './api';

export default {
  abrir: (datos) => api.post('/cajas/abrir', datos).then(unwrap),
  actual: () => api.get('/cajas/actual').then(unwrap),
  listar: (params) => api.get('/cajas', { params }).then(unwrapList),
  obtener: (id) => api.get(`/cajas/${id}`).then(unwrap),
  movimientos: (id) => api.get(`/cajas/${id}/movimientos`).then(unwrap),
  cerrar: (id, datos) => api.post(`/cajas/${id}/cerrar`, datos).then(unwrap)
};
