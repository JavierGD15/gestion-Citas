<template>
  <BaseModal :model-value="modelValue" :title="title" size="sm" @update:model-value="$emit('update:modelValue', $event)">
    <p>{{ message }}</p>
    <FormField v-if="requireReason" id="motivo-confirmacion" :label="reasonLabel" :error="error" required>
      <textarea id="motivo-confirmacion" v-model.trim="motivo" rows="3" maxlength="500"></textarea>
    </FormField>
    <template #footer>
      <button type="button" class="btn btn-secondary" @click="$emit('update:modelValue', false)">Cancelar</button>
      <button type="button" class="btn" :class="danger ? 'btn-danger' : 'btn-primary'" :disabled="loading" @click="confirmar">
        {{ confirmText }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, watch } from 'vue';
import BaseModal from './BaseModal.vue';
import FormField from './FormField.vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: 'Confirmar' },
  message: { type: String, default: '' },
  confirmText: { type: String, default: 'Confirmar' },
  danger: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  requireReason: { type: Boolean, default: false },
  reasonLabel: { type: String, default: 'Motivo' },
  minReason: { type: Number, default: 5 }
});

const emit = defineEmits(['update:modelValue', 'confirm']);

const motivo = ref('');
const error = ref('');

watch(
  () => props.modelValue,
  (abierto) => {
    if (abierto) {
      motivo.value = '';
      error.value = '';
    }
  }
);

function confirmar() {
  if (props.requireReason && motivo.value.length < props.minReason) {
    error.value = `Ingrese un motivo de al menos ${props.minReason} caracteres`;
    return;
  }
  emit('confirm', motivo.value);
}
</script>
