import api, { unwrap } from './api';

export default {
  listar: (params) => api.get('/pagos', { params }).then((r) => ({ data: r.data.data, meta: r.data.meta, totales: r.data.totales })),
  obtener: (id) => api.get(`/pagos/${id}`).then(unwrap),
  porComprobante: (numero) => api.get(`/pagos/comprobante/${encodeURIComponent(numero)}`).then(unwrap),
  registrar: (datos) => api.post('/pagos', datos).then(unwrap),
  anular: (id, motivo) => api.patch(`/pagos/${id}/anular`, { motivo }).then(unwrap),
  deCita: (citaId) => api.get(`/citas/${citaId}/pagos`).then(unwrap),
  saldoCita: (citaId) => api.get(`/citas/${citaId}/saldo`).then(unwrap),
  dePaciente: (pacienteId) => api.get(`/pacientes/${pacienteId}/pagos`).then(unwrap),
  saldosPendientes: (params) => api.get('/pagos/saldos-pendientes', { params }).then((r) => ({ data: r.data.data, meta: r.data.meta, totales: r.data.totales }))
};
