<template>
  <div ref="raiz" class="form-field" :class="{ 'has-error': errorVisible }" @input="editado = true" @change="editado = true">
    <label v-if="label" :for="id">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>
    <slot />
    <small v-if="errorVisible" class="field-error">{{ errorVisible }}</small>
    <small v-else-if="hint" class="field-hint">{{ hint }}</small>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps({
  id: { type: String, default: '' },
  label: { type: String, default: '' },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
  required: { type: Boolean, default: false }
});

// Al corregir el campo se oculta su error; vuelve a mostrarse si llega un error nuevo
// o cuando se envía otra vez el formulario y la validación lo repite.
const raiz = ref(null);
const editado = ref(false);
const errorVisible = computed(() => (editado.value ? '' : props.error));
const reiniciar = () => {
  editado.value = false;
};
let formulario = null;

watch(() => props.error, reiniciar);

onMounted(() => {
  formulario = raiz.value?.closest('form') || null;
  formulario?.addEventListener('submit', reiniciar, true);
});

onBeforeUnmount(() => {
  formulario?.removeEventListener('submit', reiniciar, true);
});
</script>
