import api, { unwrap, unwrapList } from './api';

export default {
  listar: (params) => api.get('/usuarios', { params }).then(unwrapList),
  obtener: (id) => api.get(`/usuarios/${id}`).then(unwrap),
  crear: (datos) => api.post('/usuarios', datos).then(unwrap),
  actualizar: (id, datos) => api.put(`/usuarios/${id}`, datos).then(unwrap),
  cambiarEstado: (id, estado) => api.patch(`/usuarios/${id}/estado`, { estado }).then(unwrap),
  restablecerPassword: (id, password) => api.patch(`/usuarios/${id}/password`, { password }).then(unwrap)
};
