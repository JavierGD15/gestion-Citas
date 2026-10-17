<template>
  <BaseModal :model-value="modelValue" :title="responsable ? 'Editar responsable' : 'Registrar responsable'" size="lg" @update:model-value="$emit('update:modelValue', $event)">
    <form id="form-responsable" class="form-grid" novalidate @submit.prevent="guardar">
      <FormField id="r-nombres" label="Nombres" :error="errores.nombres" required>
        <input id="r-nombres" v-model.trim="form.nombres" maxlength="80" />
      </FormField>
      <FormField id="r-apellidos" label="Apellidos" :error="errores.apellidos" required>
        <input id="r-apellidos" v-model.trim="form.apellidos" maxlength="80" />
      </FormField>
      <FormField id="r-parentesco" label="Parentesco" :error="errores.parentesco" required>
        <input id="r-parentesco" v-model.trim="form.parentesco" list="parentescos" maxlength="50" />
        <datalist id="parentescos">
          <option v-for="opcion in PARENTESCOS" :key="opcion" :value="opcion" />
        </datalist>
      </FormField>
      <FormField id="r-telefono" label="Teléfono" :error="errores.telefono" required>
        <input id="r-telefono" v-model.trim="form.telefono" type="tel" maxlength="20" />
      </FormField>
      <FormField id="r-correo" label="Correo electrónico" :error="errores.correo" required>
        <input id="r-correo" v-model.trim="form.correo" type="email" maxlength="120" />
      </FormField>
      <FormField id="r-direccion" label="Dirección" :error="errores.direccion" required>
        <input id="r-direccion" v-model.trim="form.direccion" maxlength="250" />
      </FormField>
      <FormField id="r-foto" label="URL de fotografía" :error="errores.fotografia" class="span-all">
        <div class="foto-row">
          <AvatarImg :src="form.fotografia" :nombre="`${form.nombres} ${form.apellidos}`" :size="48" />
          <input id="r-foto" v-model.trim="form.fotografia" type="url" placeholder="https://" />
        </div>
      </FormField>
      <p v-if="pacienteInicial" class="alert alert-info span-all">Se asociará al paciente {{ pacienteInicial.nombreCompleto }}.</p>
    </form>
    <template #footer>
      <button type="button" class="btn btn-secondary" @click="$emit('update:modelValue', false)">Cancelar</button>
      <button type="submit" form="form-responsable" class="btn btn-primary" :disabled="guardando">Guardar</button>
    </template>
  </BaseModal>
</template>

<script setup>
import { reactive, ref, watch } from 'vue';
import AvatarImg from '@/components/common/AvatarImg.vue';
import BaseModal from '@/components/common/BaseModal.vue';
import FormField from '@/components/common/FormField.vue';
import responsablesService from '@/services/responsables.service';
import { useNotificationsStore } from '@/stores/notifications';
import { PARENTESCOS } from '@/utils/catalogos';
import { erroresPorCampo, mensajeError } from '@/utils/errors';
import { correo, minimo, requerido, telefono, validarFormulario } from '@/utils/validators';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  responsable: { type: Object, default: null },
  pacienteInicial: { type: Object, default: null }
});

const emit = defineEmits(['update:modelValue', 'saved']);
const notifications = useNotificationsStore();

const CAMPOS = ['nombres', 'apellidos', 'parentesco', 'telefono', 'correo', 'direccion', 'fotografia'];
const vacio = () => Object.fromEntries(CAMPOS.map((campo) => [campo, '']));
const form = reactive(vacio());
const errores = ref({});
const guardando = ref(false);

watch(
  () => props.modelValue,
  (abierto) => {
    if (abierto) {
      errores.value = {};
      Object.assign(form, vacio(), props.responsable ? Object.fromEntries(CAMPOS.map((campo) => [campo, props.responsable[campo] || ''])) : {});
    }
  }
);

async function guardar() {
  errores.value = validarFormulario(form, {
    nombres: [requerido, minimo(2)],
    apellidos: [requerido, minimo(2)],
    parentesco: [requerido, minimo(2)],
    telefono: [requerido, telefono],
    correo: [requerido, correo],
    direccion: [requerido, minimo(3)]
  });
  if (Object.keys(errores.value).length > 0) {
    return;
  }

  guardando.value = true;
  try {
    const resultado = props.responsable
      ? await responsablesService.actualizar(props.responsable._id, { ...form })
      : await responsablesService.crear({ ...form, pacientes: props.pacienteInicial ? [props.pacienteInicial._id] : [] });
    notifications.exito(props.responsable ? 'Responsable actualizado correctamente' : 'Responsable registrado correctamente');
    emit('saved', resultado);
    emit('update:modelValue', false);
  } catch (error) {
    errores.value = erroresPorCampo(error);
    notifications.error(mensajeError(error));
  } finally {
    guardando.value = false;
  }
}
</script>

<style scoped>
.foto-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
</style>
