<template>
  <BaseModal :model-value="modelValue" :title="paciente ? 'Editar paciente' : 'Registrar paciente'" size="lg" @update:model-value="$emit('update:modelValue', $event)">
    <form id="form-paciente" class="form-grid" novalidate @submit.prevent="guardar">
      <FormField id="p-nombres" label="Nombres" :error="errores.nombres" required>
        <input id="p-nombres" v-model.trim="form.nombres" maxlength="80" />
      </FormField>
      <FormField id="p-apellidos" label="Apellidos" :error="errores.apellidos" required>
        <input id="p-apellidos" v-model.trim="form.apellidos" maxlength="80" />
      </FormField>
      <FormField id="p-nacimiento" label="Fecha de nacimiento" :error="errores.fechaNacimiento" :hint="edadTexto" required>
        <input id="p-nacimiento" v-model="form.fechaNacimiento" type="date" :max="hoy" />
      </FormField>
      <FormField id="p-sexo" label="Sexo" :error="errores.sexo" required>
        <select id="p-sexo" v-model="form.sexo">
          <option value="">Seleccione</option>
          <option v-for="(etiqueta, valor) in SEXOS" :key="valor" :value="valor">{{ etiqueta }}</option>
        </select>
      </FormField>
      <FormField id="p-telefono" label="Teléfono" :error="errores.telefono" required>
        <input id="p-telefono" v-model.trim="form.telefono" type="tel" maxlength="20" />
      </FormField>
      <FormField id="p-inicio" label="Fecha de inicio del proceso" :error="errores.fechaInicioProceso" required>
        <input id="p-inicio" v-model="form.fechaInicioProceso" type="date" />
      </FormField>
      <FormField id="p-direccion" label="Dirección" :error="errores.direccion" class="span-all" required>
        <input id="p-direccion" v-model.trim="form.direccion" maxlength="250" />
      </FormField>
      <FormField id="p-foto" label="URL de fotografía" :error="errores.fotografia" class="span-all">
        <div class="foto-row">
          <AvatarImg :src="form.fotografia" :nombre="`${form.nombres} ${form.apellidos}`" :size="48" />
          <input id="p-foto" v-model.trim="form.fotografia" type="url" placeholder="https://" />
        </div>
      </FormField>
      <FormField id="p-observaciones" label="Observaciones administrativas generales" :error="errores.observaciones" class="span-all">
        <textarea id="p-observaciones" v-model.trim="form.observaciones" maxlength="2000"></textarea>
      </FormField>
    </form>
    <template #footer>
      <button type="button" class="btn btn-secondary" @click="$emit('update:modelValue', false)">Cancelar</button>
      <button type="submit" form="form-paciente" class="btn btn-primary" :disabled="guardando">Guardar</button>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import AvatarImg from '@/components/common/AvatarImg.vue';
import BaseModal from '@/components/common/BaseModal.vue';
import FormField from '@/components/common/FormField.vue';
import pacientesService from '@/services/pacientes.service';
import { useNotificationsStore } from '@/stores/notifications';
import { SEXOS } from '@/utils/catalogos';
import { erroresPorCampo, mensajeError } from '@/utils/errors';
import { fechaISO } from '@/utils/format';
import { minimo, requerido, telefono, validarFormulario } from '@/utils/validators';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  paciente: { type: Object, default: null }
});

const emit = defineEmits(['update:modelValue', 'saved']);
const notifications = useNotificationsStore();
const hoy = fechaISO();

const vacio = () => ({
  nombres: '',
  apellidos: '',
  fechaNacimiento: '',
  sexo: '',
  telefono: '',
  direccion: '',
  fechaInicioProceso: hoy,
  fotografia: '',
  observaciones: ''
});

const form = reactive(vacio());
const errores = ref({});
const guardando = ref(false);

watch(
  () => props.modelValue,
  (abierto) => {
    if (!abierto) {
      return;
    }
    errores.value = {};
    const p = props.paciente;
    Object.assign(
      form,
      vacio(),
      p
        ? {
            nombres: p.nombres,
            apellidos: p.apellidos,
            fechaNacimiento: p.fechaNacimiento?.slice(0, 10),
            sexo: p.sexo,
            telefono: p.telefono,
            direccion: p.direccion,
            fechaInicioProceso: p.fechaInicioProceso?.slice(0, 10),
            fotografia: p.fotografia,
            observaciones: p.observaciones
          }
        : {}
    );
  }
);

const edadTexto = computed(() => {
  if (!form.fechaNacimiento) {
    return '';
  }
  const [anio, mes, dia] = form.fechaNacimiento.split('-').map(Number);
  const [hAnio, hMes, hDia] = hoy.split('-').map(Number);
  let edad = hAnio - anio;
  if (hMes < mes || (hMes === mes && hDia < dia)) {
    edad -= 1;
  }
  return edad >= 0 ? `Edad: ${edad} años${edad < 18 ? ' (menor de edad, requiere responsable)' : ''}` : '';
});

const noFutura = (valor) => !valor || valor <= hoy || 'La fecha no puede ser futura';

async function guardar() {
  errores.value = validarFormulario(form, {
    nombres: [requerido, minimo(2)],
    apellidos: [requerido, minimo(2)],
    fechaNacimiento: [requerido, noFutura],
    sexo: [requerido],
    telefono: [requerido, telefono],
    direccion: [requerido, minimo(3)],
    fechaInicioProceso: [requerido]
  });
  if (Object.keys(errores.value).length > 0) {
    return;
  }

  guardando.value = true;
  try {
    const resultado = props.paciente
      ? await pacientesService.actualizar(props.paciente._id, { ...form })
      : await pacientesService.crear({ ...form });
    notifications.exito(props.paciente ? 'Paciente actualizado correctamente' : 'Paciente registrado correctamente');
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
