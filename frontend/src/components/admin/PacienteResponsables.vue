<template>
  <div class="card">
    <div class="section-header">
      <h2>Responsables</h2>
      <div v-if="editable" class="actions">
        <button type="button" class="btn btn-secondary btn-sm" @click="mostrarAsociar = true">Asociar existente</button>
        <button type="button" class="btn btn-primary btn-sm" @click="mostrarFormulario = true">Registrar nuevo</button>
      </div>
    </div>

    <p v-if="paciente.esMenor && responsables.length === 0" class="alert alert-warning">
      El paciente es menor de edad. Debe registrar al menos un responsable antes de programar citas.
    </p>

    <div class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Parentesco</th>
            <th>Teléfono</th>
            <th>Correo</th>
            <th>Dirección</th>
            <th v-if="editable"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="responsable in responsables" :key="responsable._id">
            <td>
              <div class="persona">
                <AvatarImg :src="responsable.fotografia" :nombre="responsable.nombreCompleto" :size="32" />
                {{ responsable.nombreCompleto }}
              </div>
            </td>
            <td>{{ responsable.parentesco }}</td>
            <td>{{ responsable.telefono }}</td>
            <td>{{ responsable.correo }}</td>
            <td>{{ responsable.direccion }}</td>
            <td v-if="editable">
              <button type="button" class="btn btn-secondary btn-sm" @click="desasociar(responsable)">Desasociar</button>
            </td>
          </tr>
          <tr v-if="responsables.length === 0">
            <td :colspan="editable ? 6 : 5" class="text-muted">No hay responsables asociados</td>
          </tr>
        </tbody>
      </table>
    </div>

    <ResponsableForm v-model="mostrarFormulario" :paciente-inicial="paciente" @saved="cargar" />

    <BaseModal v-model="mostrarAsociar" title="Asociar responsable existente">
      <FormField id="responsable-existente" label="Responsable" required>
        <BuscadorSelector
          id="responsable-existente"
          v-model="responsableSeleccionado"
          :fetcher="responsablesService.buscar"
          :detalle="(r) => `${r.parentesco} · ${r.telefono}`"
          placeholder="Buscar responsable por nombre, teléfono o correo"
        />
      </FormField>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="mostrarAsociar = false">Cancelar</button>
        <button type="button" class="btn btn-primary" :disabled="!responsableSeleccionado" @click="asociar">Asociar</button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import ResponsableForm from '@/components/admin/ResponsableForm.vue';
import AvatarImg from '@/components/common/AvatarImg.vue';
import BaseModal from '@/components/common/BaseModal.vue';
import BuscadorSelector from '@/components/common/BuscadorSelector.vue';
import FormField from '@/components/common/FormField.vue';
import responsablesService from '@/services/responsables.service';
import { useNotificationsStore } from '@/stores/notifications';
import { mensajeError } from '@/utils/errors';

const props = defineProps({
  paciente: { type: Object, required: true },
  editable: { type: Boolean, default: true }
});

const notifications = useNotificationsStore();
const responsables = ref([]);
const mostrarFormulario = ref(false);
const mostrarAsociar = ref(false);
const responsableSeleccionado = ref(null);

async function cargar() {
  try {
    responsables.value = await responsablesService.porPaciente(props.paciente._id);
  } catch (error) {
    notifications.error(mensajeError(error));
  }
}

async function asociar() {
  try {
    await responsablesService.asociarPaciente(responsableSeleccionado.value._id, props.paciente._id);
    notifications.exito('Responsable asociado correctamente');
    mostrarAsociar.value = false;
    responsableSeleccionado.value = null;
    cargar();
  } catch (error) {
    notifications.error(mensajeError(error));
  }
}

async function desasociar(responsable) {
  try {
    await responsablesService.desasociarPaciente(responsable._id, props.paciente._id);
    notifications.exito('Responsable desasociado');
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
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.section-header h2 {
  margin: 0;
}

.persona {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.alert {
  margin-bottom: 1rem;
}
</style>
