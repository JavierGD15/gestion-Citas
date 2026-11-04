import api, { unwrap } from './api';

export default {
  login: (credenciales) => api.post('/auth/login', credenciales).then(unwrap),
  me: () => api.get('/auth/me').then(unwrap),
  cambiarPassword: (datos) => api.put('/auth/password', datos).then(unwrap)
};
