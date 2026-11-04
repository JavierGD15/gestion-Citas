<template>
  <div class="card">
    <div class="section-header">
      <h2>Materiales asignados</h2>
      <button type="button" class="btn btn-primary btn-sm" :disabled="paciente.estado !== 'ACTIVO'" @click="mostrarAsignar = true">Asignar material</button>
    </div>
    <div class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>Material</th>
            <th>Tipo</th>
            <th>Indicaciones</th>
            <th>Asignado</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="asignacion in asignaciones" :key="asignacion._id">
            <td>
              <a :href="asignacion.material?.enlace" target="_blank" rel="noopener noreferrer">{{ asignacion.material?.titulo }}</a>
            </td>
            <td>{{ TIPOS_MATERIAL[asignacion.material?.tipo] }}</td>
            <td>{{ asignacion.indicaciones || '—' }}</td>
            <td>
              {{ formatearFecha(asignacion.fechaAsignacion) }}
              <div class="text-muted">{{ asignacion.asignadoPor?.nombres }} {{ asignacion.asignadoPor?.apellidos }}</div>
            </td>
            <td><StatusBadge :estado="asignacion.estado" :etiquetas="{ ACTIVO: 'Vigente', INACTIVO: 'Retirada' }" /></td>
            <td>
              <button v-if="asignacion.estado === 'ACTIVO'" type="button" class="btn btn-secondary btn-sm" @click="retirar(asignacion)">Retirar</button>
            </td>
          </tr>
          <tr v-if="asignaciones.length === 0">
            <td colspan="6" class="text-muted">No hay materiales asignados</td>
          </tr>
        </tbody>
      </table>
    </div>
    <AsignarMaterialModal v-model="mostrarAsignar" :paciente-inicial="paciente" @saved="cargar" />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import AsignarMaterialModal from '@/components/admin/AsignarMaterialModal.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import materialesService from '@/services/materiales.service';
import { useNotificationsStore } from '@/stores/notifications';
import { TIPOS_MATERIAL } from '@/utils/catalogos';
import { mensajeError } from '@/utils/errors';
import { formatearFecha } from '@/utils/format';

const props = defineProps({
  paciente: { type: Object, required: true }
});

const notifications = useNotificationsStore();
const asignaciones = ref([]);
const mostrarAsignar = ref(false);

async function cargar() {
  try {
    asignaciones.value = await materialesService.porPaciente(props.paciente._id);
  } catch (error) {
    notifications.error(mensajeError(error));
  }
}

async function retirar(asignacion) {
  try {
    await materialesService.retirar(asignacion._id);
    notifications.exito('Asignación retirada');
    cargar();
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
