<template>
  <BaseModal :model-value="modelValue" title="Asignar material" @update:model-value="$emit('update:modelValue', $event)">
    <form id="form-asignar" class="form-stack" novalidate @submit.prevent="guardar">
      <FormField id="am-material" label="Material" :error="errores.material" required>
        <BuscadorSelector
          id="am-material"
          v-model="material"
          :fetcher="materialesService.buscarActivos"
          :etiqueta="(m) => m.titulo"
          :detalle="(m) => `${m.codigo} · ${TIPOS_MATERIAL[m.tipo]}`"
          :con-avatar="false"
          :disabled="Boolean(materialInicial)"
          placeholder="Buscar material activo"
        />
      </FormField>
      <FormField id="am-paciente" label="Paciente" :error="errores.paciente" required>
        <BuscadorSelector
          id="am-paciente"
          v-model="paciente"
          :fetcher="(q) => buscarPacientes(q, true)"
          :detalle="(p) => `${p.codigo} · ${p.edad} años`"
          :disabled="Boolean(pacienteInicial)"
          placeholder="Buscar paciente activo"
        />
      </FormField>
      <FormField id="am-indicaciones" label="Indicaciones" :error="errores.indicaciones">
        <textarea id="am-indicaciones" v-model.trim="indicaciones" rows="3" maxlength="1000"></textarea>
      </FormField>
    </form>
    <template #footer>
      <button type="button" class="btn btn-secondary" @click="$emit('update:modelValue', false)">Cancelar</button>
      <button type="submit" form="form-asignar" class="btn btn-primary" :disabled="guardando">Asignar</button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, watch } from 'vue';
import BaseModal from '@/components/common/BaseModal.vue';
import BuscadorSelector from '@/components/common/BuscadorSelector.vue';
import FormField from '@/components/common/FormField.vue';
import materialesService from '@/services/materiales.service';
import { buscarPacientes } from '@/services/pacientes.service';
import { useNotificationsStore } from '@/stores/notifications';
import { TIPOS_MATERIAL } from '@/utils/catalogos';
import { mensajeError } from '@/utils/errors';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  materialInicial: { type: Object, default: null },
  pacienteInicial: { type: Object, default: null }
});

const emit = defineEmits(['update:modelValue', 'saved']);
const notifications = useNotificationsStore();

const material = ref(null);
const paciente = ref(null);
const indicaciones = ref('');
const errores = ref({});
const guardando = ref(false);

watch(
  () => props.modelValue,
  (abierto) => {
    if (abierto) {
      material.value = props.materialInicial;
      paciente.value = props.pacienteInicial;
      indicaciones.value = '';
      errores.value = {};
    }
  }
);

async function guardar() {
  errores.value = {};
  if (!material.value) {
    errores.value.material = 'Seleccione un material';
  }
  if (!paciente.value) {
    errores.value.paciente = 'Seleccione un paciente';
  }
  if (Object.keys(errores.value).length > 0) {
    return;
  }
  guardando.value = true;
  try {
    const asignacion = await materialesService.asignar(material.value._id, { paciente: paciente.value._id, indicaciones: indicaciones.value });
    notifications.exito('Material asignado correctamente');
    emit('saved', asignacion);
    emit('update:modelValue', false);
  } catch (error) {
    notifications.error(mensajeError(error));
  } finally {
    guardando.value = false;
  }
}
</script>
