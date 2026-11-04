<template>
  <div class="card">
    <h2>Movimientos de la caja</h2>
    <div class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>Comprobante</th>
            <th>Hora</th>
            <th>Paciente</th>
            <th>Cita</th>
            <th>Método</th>
            <th class="text-right">Monto</th>
            <th>Estado</th>
            <th v-if="permiteAnular"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pago in movimientos" :key="pago._id">
            <td><RouterLink :to="{ name: 'admin-comprobante', params: { id: pago._id } }">{{ pago.comprobante }}</RouterLink></td>
            <td>{{ formatearFechaHora(pago.fechaPago) }}</td>
            <td>{{ pago.paciente?.nombres }} {{ pago.paciente?.apellidos }}</td>
            <td>
              <RouterLink :to="{ name: 'admin-cita-detalle', params: { id: pago.cita?._id } }">{{ pago.cita?.codigo }}</RouterLink>
              <div class="text-muted">{{ pago.cita?.servicio?.nombre }}</div>
            </td>
            <td>{{ METODOS_PAGO[pago.metodo] }}</td>
            <td class="text-right" :class="{ tachado: pago.estado === 'ANULADO' }">{{ formatearMoneda(pago.monto) }}</td>
            <td>
              <StatusBadge :estado="pago.estado" :etiquetas="ESTADOS_PAGO" />
              <div v-if="pago.motivoAnulacion" class="text-muted small">{{ pago.motivoAnulacion }}</div>
            </td>
            <td v-if="permiteAnular">
              <button v-if="pago.estado === 'REGISTRADO'" type="button" class="btn btn-danger btn-sm" @click="abrirAnulacion(pago)">Anular</button>
            </td>
          </tr>
          <tr v-if="movimientos.length === 0">
            <td :colspan="permiteAnular ? 8 : 7" class="text-muted">La caja no tiene movimientos</td>
          </tr>
        </tbody>
      </table>
    </div>

    <ConfirmDialog
      v-model="mostrarAnulacion"
      title="Anular pago"
      :message="`Se anulará el comprobante ${seleccionado?.comprobante} por ${formatearMoneda(seleccionado?.monto)}.`"
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
import { onMounted, ref, watch } from 'vue';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import cajasService from '@/services/cajas.service';
import pagosService from '@/services/pagos.service';
import { useNotificationsStore } from '@/stores/notifications';
import { ESTADOS_PAGO, METODOS_PAGO } from '@/utils/catalogos';
import { mensajeError } from '@/utils/errors';
import { formatearFechaHora, formatearMoneda } from '@/utils/format';

const props = defineProps({
  cajaId: { type: String, required: true },
  permiteAnular: { type: Boolean, default: false },
  version: { type: Number, default: 0 }
});

const emit = defineEmits(['changed']);
const notifications = useNotificationsStore();

const movimientos = ref([]);
const mostrarAnulacion = ref(false);
const seleccionado = ref(null);
const procesando = ref(false);

async function cargar() {
  try {
    movimientos.value = await cajasService.movimientos(props.cajaId);
  } catch (error) {
    notifications.error(mensajeError(error));
  }
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
    await cargar();
    emit('changed');
  } catch (error) {
    notifications.error(mensajeError(error));
  } finally {
    procesando.value = false;
  }
}

watch(() => [props.cajaId, props.version], cargar);
onMounted(cargar);
</script>

<style scoped>
.tachado {
  text-decoration: line-through;
  color: var(--color-muted);
}

.small {
  font-size: 0.8rem;
  max-width: 220px;
}
</style>
