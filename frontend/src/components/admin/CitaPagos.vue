<template>
  <div class="card">
    <div class="section-header">
      <h2>Pagos de la cita</h2>
      <button
        v-if="cita.estado !== 'CANCELADA' && resumen && resumen.saldo > 0"
        type="button"
        class="btn btn-primary btn-sm"
        @click="mostrarFormulario = true"
      >
        Registrar pago
      </button>
    </div>

    <div v-if="resumen" class="grid-3 resumen">
      <div class="stat-card">
        <span class="stat-label">Costo de la cita</span>
        <span class="stat-value">{{ formatearMoneda(resumen.precio) }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Total pagado</span>
        <span class="stat-value text-success">{{ formatearMoneda(resumen.totalPagado) }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Saldo pendiente</span>
        <span class="stat-value" :class="{ 'text-danger': resumen.saldo > 0 }">{{ formatearMoneda(resumen.saldo) }}</span>
        <StatusBadge :estado="resumen.estadoFinanciero" :etiquetas="ESTADOS_FINANCIEROS" financiero />
      </div>
    </div>

    <div class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>Comprobante</th>
            <th>Fecha y hora</th>
            <th>Método</th>
            <th class="text-right">Monto</th>
            <th>Registró</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pago in pagos" :key="pago._id">
            <td><RouterLink :to="{ name: 'admin-comprobante', params: { id: pago._id } }">{{ pago.comprobante }}</RouterLink></td>
            <td>{{ formatearFechaHora(pago.fechaPago) }}</td>
            <td>{{ METODOS_PAGO[pago.metodo] }}</td>
            <td class="text-right">{{ formatearMoneda(pago.monto) }}</td>
            <td>{{ pago.registradoPor?.nombres }} {{ pago.registradoPor?.apellidos }}</td>
            <td>
              <StatusBadge :estado="pago.estado" :etiquetas="ESTADOS_PAGO" />
              <div v-if="pago.motivoAnulacion" class="text-muted small">{{ pago.motivoAnulacion }}</div>
            </td>
            <td>
              <button
                v-if="pago.estado === 'REGISTRADO' && pago.caja?.estado === 'ABIERTA'"
                type="button"
                class="btn btn-danger btn-sm"
                @click="abrirAnulacion(pago)"
              >
                Anular
              </button>
              <small v-else-if="pago.estado === 'REGISTRADO'" class="text-muted">Caja cerrada</small>
            </td>
          </tr>
          <tr v-if="pagos.length === 0">
            <td colspan="7" class="text-muted">La cita no registra pagos</td>
          </tr>
        </tbody>
      </table>
    </div>

    <PagoForm v-model="mostrarFormulario" :cita-inicial="citaConResumen" @saved="actualizar" />

    <ConfirmDialog
      v-model="mostrarAnulacion"
      title="Anular pago"
      :message="`Se anulará el comprobante ${seleccionado?.comprobante} por ${formatearMoneda(seleccionado?.monto)}. El pago dejará de contar en el saldo y en los ingresos.`"
      confirm-text="Anular pago"
      danger
      require-reason
      reason-label="Justificación de la anulación"
      :min-reason="10"
      :loading="procesando"
      @confirm="anular"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import PagoForm from '@/components/admin/PagoForm.vue';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import pagosService from '@/services/pagos.service';
import { useCajaStore } from '@/stores/caja';
import { useNotificationsStore } from '@/stores/notifications';
import { ESTADOS_FINANCIEROS, ESTADOS_PAGO, METODOS_PAGO } from '@/utils/catalogos';
import { mensajeError } from '@/utils/errors';
import { formatearFechaHora, formatearMoneda } from '@/utils/format';

const props = defineProps({
  cita: { type: Object, required: true }
});

const emit = defineEmits(['changed']);
const caja = useCajaStore();
const notifications = useNotificationsStore();

const pagos = ref([]);
const resumen = ref(null);
const mostrarFormulario = ref(false);
const mostrarAnulacion = ref(false);
const seleccionado = ref(null);
const procesando = ref(false);

const citaConResumen = computed(() => ({ ...props.cita, finanzas: resumen.value }));

async function cargar() {
  try {
    const resultado = await pagosService.deCita(props.cita._id);
    pagos.value = resultado.pagos;
    resumen.value = resultado.resumen;
  } catch (error) {
    notifications.error(mensajeError(error));
  }
}

async function actualizar() {
  await cargar();
  emit('changed');
}

function abrirAnulacion(pago) {
  seleccionado.value = pago;
  mostrarAnulacion.value = true;
}

async function anular(motivo) {
  procesando.value = true;
  try {
    await pagosService.anular(seleccionado.value._id, motivo);
    notifications.exito('Pago anulado correctamente');
    mostrarAnulacion.value = false;
    caja.cargarActual().catch(() => {});
    actualizar();
  } catch (error) {
    notifications.error(mensajeError(error));
  } finally {
    procesando.value = false;
  }
}

onMounted(cargar);
</script>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h2 {
  margin: 0;
}

.resumen {
  margin-bottom: 1rem;
}

.small {
  font-size: 0.8rem;
  max-width: 220px;
}
</style>
