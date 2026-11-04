<template>
  <section>
    <div class="page-header">
      <h1>Pagos</h1>
      <div class="actions">
        <form class="buscar-comprobante" @submit.prevent="buscarComprobante">
          <input v-model.trim="comprobante" type="search" placeholder="REC-2026-000001" aria-label="Buscar comprobante" />
          <button type="submit" class="btn btn-secondary">Buscar</button>
        </form>
        <button type="button" class="btn btn-primary" @click="mostrarFormulario = true">Registrar pago</button>
      </div>
    </div>

    <div class="tabs">
      <button type="button" :class="{ active: tab === 'pagos' }" @click="tab = 'pagos'">Pagos registrados</button>
      <button type="button" :class="{ active: tab === 'saldos' }" @click="tab = 'saldos'">Saldos pendientes</button>
    </div>

    <template v-if="tab === 'pagos'">
      <div class="grid-3 totales">
        <div v-for="(etiqueta, metodo) in METODOS_PAGO" :key="metodo" class="card stat-card">
          <span class="stat-label">{{ etiqueta }}</span>
          <span class="stat-value">{{ formatearMoneda(totales.porMetodo?.[metodo] || 0) }}</span>
        </div>
        <div class="card stat-card">
          <span class="stat-label">Total válido (filtro)</span>
          <span class="stat-value text-success">{{ formatearMoneda(totales.totalValido || 0) }}</span>
        </div>
      </div>

      <div class="card">
        <form class="toolbar" @submit.prevent="buscar">
          <FormField id="pg-desde" label="Desde">
            <input id="pg-desde" v-model="filtros.desde" type="date" />
          </FormField>
          <FormField id="pg-hasta" label="Hasta">
            <input id="pg-hasta" v-model="filtros.hasta" type="date" />
          </FormField>
          <FormField id="pg-metodo-f" label="Método">
            <select id="pg-metodo-f" v-model="filtros.metodo">
              <option value="">Todos</option>
              <option v-for="(etiqueta, valor) in METODOS_PAGO" :key="valor" :value="valor">{{ etiqueta }}</option>
            </select>
          </FormField>
          <FormField id="pg-estado-f" label="Estado">
            <select id="pg-estado-f" v-model="filtros.estado">
              <option value="">Todos</option>
              <option v-for="(etiqueta, valor) in ESTADOS_PAGO" :key="valor" :value="valor">{{ etiqueta }}</option>
            </select>
          </FormField>
          <FormField id="pg-paciente-f" label="Paciente">
            <BuscadorSelector id="pg-paciente-f" v-model="pacienteFiltro" :fetcher="(q) => buscarPacientes(q)" :detalle="(p) => p.codigo" placeholder="Todos" />
          </FormField>
          <button type="submit" class="btn btn-secondary">Filtrar</button>
        </form>

        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>Comprobante</th>
                <th>Fecha y hora</th>
                <th>Paciente</th>
                <th>Cita</th>
                <th>Método</th>
                <th class="text-right">Monto</th>
                <th>Registró</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pago in items" :key="pago._id">
                <td><RouterLink :to="{ name: 'admin-comprobante', params: { id: pago._id } }">{{ pago.comprobante }}</RouterLink></td>
                <td>{{ formatearFechaHora(pago.fechaPago) }}</td>
                <td>
                  <RouterLink :to="{ name: 'admin-paciente-detalle', params: { id: pago.paciente?._id } }">{{ pago.paciente?.nombres }} {{ pago.paciente?.apellidos }}</RouterLink>
                </td>
                <td>
                  <RouterLink :to="{ name: 'admin-cita-detalle', params: { id: pago.cita?._id } }">{{ pago.cita?.codigo }}</RouterLink>
                  <div class="text-muted">{{ pago.cita?.servicio?.nombre }}</div>
                </td>
                <td>{{ METODOS_PAGO[pago.metodo] }}</td>
                <td class="text-right" :class="{ tachado: pago.estado === 'ANULADO' }">{{ formatearMoneda(pago.monto) }}</td>
                <td>{{ pago.registradoPor?.nombres }} {{ pago.registradoPor?.apellidos }}</td>
                <td><StatusBadge :estado="pago.estado" :etiquetas="ESTADOS_PAGO" /></td>
              </tr>
              <tr v-if="!cargando && items.length === 0">
                <td colspan="8" class="text-muted">No hay pagos para los filtros seleccionados</td>
              </tr>
            </tbody>
          </table>
        </div>
        <PaginationBar :meta="meta" @change="cargar" />
      </div>
    </template>

    <div v-else class="card">
      <p class="text-muted">Total de saldos pendientes: <strong>{{ formatearMoneda(saldos.totales?.saldoPendiente || 0) }}</strong></p>
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>Cita</th>
              <th>Fecha</th>
              <th>Paciente</th>
              <th>Servicio</th>
              <th class="text-right">Costo</th>
              <th class="text-right">Pagado</th>
              <th class="text-right">Saldo</th>
              <th>Estado financiero</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cita in saldos.data" :key="cita._id">
              <td><RouterLink :to="{ name: 'admin-cita-detalle', params: { id: cita._id } }">{{ cita.codigo }}</RouterLink></td>
              <td>{{ formatearFecha(cita.fecha) }} {{ cita.horaInicio }}</td>
              <td>{{ cita.paciente?.nombres }} {{ cita.paciente?.apellidos }}</td>
              <td>{{ cita.servicio?.nombre }}</td>
              <td class="text-right">{{ formatearMoneda(cita.precio) }}</td>
              <td class="text-right">{{ formatearMoneda(cita.totalPagado) }}</td>
              <td class="text-right text-danger"><strong>{{ formatearMoneda(cita.saldo) }}</strong></td>
              <td><StatusBadge :estado="cita.estadoFinanciero" :etiquetas="ESTADOS_FINANCIEROS" financiero /></td>
            </tr>
            <tr v-if="saldos.data.length === 0">
              <td colspan="8" class="text-muted">No hay saldos pendientes</td>
            </tr>
          </tbody>
        </table>
      </div>
      <PaginationBar :meta="saldos.meta" @change="cargarSaldos" />
    </div>

    <PagoForm v-model="mostrarFormulario" @saved="(r) => router.push({ name: 'admin-comprobante', params: { id: r.pago._id } })" />
  </section>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import PagoForm from '@/components/admin/PagoForm.vue';
import BuscadorSelector from '@/components/common/BuscadorSelector.vue';
import FormField from '@/components/common/FormField.vue';
import PaginationBar from '@/components/common/PaginationBar.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { buscarPacientes } from '@/services/pacientes.service';
import pagosService from '@/services/pagos.service';
import { useNotificationsStore } from '@/stores/notifications';
import { ESTADOS_FINANCIEROS, ESTADOS_PAGO, METODOS_PAGO } from '@/utils/catalogos';
import { mensajeError } from '@/utils/errors';
import { fechaISO, formatearFecha, formatearFechaHora, formatearMoneda } from '@/utils/format';

const router = useRouter();
const notifications = useNotificationsStore();

const tab = ref('pagos');
const items = ref([]);
const meta = ref(null);
const totales = ref({});
const cargando = ref(false);
const filtros = ref({ desde: fechaISO(), hasta: fechaISO(), metodo: '', estado: '' });
const pacienteFiltro = ref(null);
const saldos = ref({ data: [], meta: null, totales: {} });
const comprobante = ref('');
const mostrarFormulario = ref(false);

async function cargar(page = 1) {
  cargando.value = true;
  try {
    const params = Object.fromEntries(Object.entries(filtros.value).filter(([, v]) => v));
    if (pacienteFiltro.value) {
      params.paciente = pacienteFiltro.value._id;
    }
    const resultado = await pagosService.listar({ ...params, page });
    items.value = resultado.data;
    meta.value = resultado.meta;
    totales.value = resultado.totales;
  } catch (error) {
    notifications.error(mensajeError(error));
  } finally {
    cargando.value = false;
  }
}

const buscar = () => cargar(1);

async function cargarSaldos(page = 1) {
  try {
    saldos.value = await pagosService.saldosPendientes({ page });
  } catch (error) {
    notifications.error(mensajeError(error));
  }
}

async function buscarComprobante() {
  if (!comprobante.value) {
    return;
  }
  try {
    const pago = await pagosService.porComprobante(comprobante.value.toUpperCase());
    router.push({ name: 'admin-comprobante', params: { id: pago._id } });
  } catch (error) {
    notifications.error(mensajeError(error));
  }
}

watch(tab, (valor) => valor === 'saldos' && cargarSaldos());

onMounted(() => cargar(1));
</script>

<style scoped>
.totales {
  margin-bottom: 1rem;
}

.buscar-comprobante {
  display: flex;
  gap: 0.4rem;
}

.buscar-comprobante input {
  width: 190px;
}

.tachado {
  text-decoration: line-through;
  color: var(--color-muted);
}
</style>
