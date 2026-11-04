<template>
  <div class="card">
    <h2>Historial de pagos</h2>
    <div v-if="resumen" class="grid-3 resumen">
      <div class="stat-card">
        <span class="stat-label">Total de citas vigentes</span>
        <span class="stat-value">{{ formatearMoneda(resumen.precio) }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Total pagado</span>
        <span class="stat-value text-success">{{ formatearMoneda(resumen.totalPagado) }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Saldo pendiente</span>
        <span class="stat-value" :class="{ 'text-danger': resumen.saldo > 0 }">{{ formatearMoneda(resumen.saldo) }}</span>
      </div>
    </div>
    <div class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>Comprobante</th>
            <th>Fecha y hora</th>
            <th>Cita</th>
            <th>Método</th>
            <th class="text-right">Monto</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pago in pagos" :key="pago._id">
            <td><RouterLink :to="{ name: 'admin-comprobante', params: { id: pago._id } }">{{ pago.comprobante }}</RouterLink></td>
            <td>{{ formatearFechaHora(pago.fechaPago) }}</td>
            <td>
              <RouterLink :to="{ name: 'admin-cita-detalle', params: { id: pago.cita?._id } }">{{ pago.cita?.codigo }}</RouterLink>
              <span class="text-muted"> · {{ pago.cita?.servicio?.nombre }}</span>
            </td>
            <td>{{ METODOS_PAGO[pago.metodo] }}</td>
            <td class="text-right">{{ formatearMoneda(pago.monto) }}</td>
            <td><StatusBadge :estado="pago.estado" :etiquetas="ESTADOS_PAGO" /></td>
          </tr>
          <tr v-if="pagos.length === 0">
            <td colspan="6" class="text-muted">El paciente no registra pagos</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import pagosService from '@/services/pagos.service';
import { useNotificationsStore } from '@/stores/notifications';
import { ESTADOS_PAGO, METODOS_PAGO } from '@/utils/catalogos';
import { mensajeError } from '@/utils/errors';
import { formatearFechaHora, formatearMoneda } from '@/utils/format';

const props = defineProps({
  paciente: { type: Object, required: true }
});

const notifications = useNotificationsStore();
const pagos = ref([]);
const resumen = ref(null);

onMounted(async () => {
  try {
    const resultado = await pagosService.dePaciente(props.paciente._id);
    pagos.value = resultado.pagos;
    resumen.value = resultado.resumen;
  } catch (error) {
    notifications.error(mensajeError(error));
  }
});
</script>

<style scoped>
.resumen {
  margin-bottom: 1rem;
}
</style>
