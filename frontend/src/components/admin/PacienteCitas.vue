<template>
  <div class="card">
    <div class="section-header">
      <h2>Historial de citas</h2>
      <button v-if="puedeProgramar" type="button" class="btn btn-primary btn-sm" :disabled="paciente.estado !== 'ACTIVO'" @click="mostrarFormulario = true">
        Programar cita
      </button>
    </div>
    <div class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Fecha</th>
            <th>Horario</th>
            <th>Servicio</th>
            <th>Profesional</th>
            <th class="text-right">Precio</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cita in citas" :key="cita._id">
            <td><RouterLink :to="{ name: 'admin-cita-detalle', params: { id: cita._id } }">{{ cita.codigo }}</RouterLink></td>
            <td>{{ formatearFecha(cita.fecha) }}</td>
            <td>{{ cita.horaInicio }} – {{ cita.horaFin }}</td>
            <td>{{ cita.servicio?.nombre }}</td>
            <td>{{ cita.profesional?.nombreCompleto }}</td>
            <td class="text-right">{{ formatearMoneda(cita.precio) }}</td>
            <td><StatusBadge :estado="cita.estado" :etiquetas="ESTADOS_CITA" /></td>
          </tr>
          <tr v-if="citas.length === 0">
            <td colspan="7" class="text-muted">El paciente no tiene citas registradas</td>
          </tr>
        </tbody>
      </table>
    </div>
    <CitaForm v-model="mostrarFormulario" :paciente-inicial="paciente" @saved="cargar" />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import CitaForm from '@/components/admin/CitaForm.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import citasService from '@/services/citas.service';
import { useNotificationsStore } from '@/stores/notifications';
import { ESTADOS_CITA } from '@/utils/catalogos';
import { mensajeError } from '@/utils/errors';
import { formatearFecha, formatearMoneda } from '@/utils/format';

const props = defineProps({
  paciente: { type: Object, required: true },
  puedeProgramar: { type: Boolean, default: false }
});

const notifications = useNotificationsStore();
const citas = ref([]);
const mostrarFormulario = ref(false);

async function cargar() {
  try {
    citas.value = await citasService.porPaciente(props.paciente._id);
  } catch (error) {
    notifications.error(mensajeError(error));
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
</style>
