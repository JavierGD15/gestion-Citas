import * as pagoService from '../services/pago.service.js';
import { created, ok } from '../utils/response.js';

export async function registrar(req, res) {
  const resultado = await pagoService.registrar(req.body, req.user);
  created(res, resultado, { message: `Pago registrado. Comprobante ${resultado.pago.comprobante}` });
}

export async function anular(req, res) {
  ok(res, await pagoService.anular(req.params.id, req.body.motivo, req.user), { message: 'Pago anulado correctamente' });
}

export async function listar(req, res) {
  const { data, meta, totales } = await pagoService.listar(req.query);
  ok(res, data, { meta, totales });
}

export async function obtener(req, res) {
  ok(res, await pagoService.obtener(req.params.id));
}

export async function porComprobante(req, res) {
  ok(res, await pagoService.obtenerPorComprobante(req.params.numero));
}

export async function pagosDeCita(req, res) {
  ok(res, await pagoService.pagosDeCita(req.params.id));
}

export async function saldoCita(req, res) {
  ok(res, await pagoService.saldoCita(req.params.id));
}

export async function pagosDePaciente(req, res) {
  ok(res, await pagoService.pagosDePaciente(req.params.id));
}

export async function saldosPendientes(req, res) {
  const { data, meta, totales } = await pagoService.saldosPendientes(req.query);
  ok(res, data, { meta, totales });
}
