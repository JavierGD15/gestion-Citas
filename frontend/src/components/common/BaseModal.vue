<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-backdrop" @mousedown.self="cerrar">
      <div class="modal" :class="`modal-${size}`" role="dialog" aria-modal="true" :aria-label="title">
        <header class="modal-header">
          <h2>{{ title }}</h2>
          <button type="button" class="modal-close" aria-label="Cerrar" @click="cerrar">×</button>
        </header>
        <div class="modal-body">
          <slot />
        </div>
        <footer v-if="$slots.footer" class="modal-footer">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { onBeforeUnmount, watch } from 'vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  size: { type: String, default: 'md' }
});

const emit = defineEmits(['update:modelValue', 'close']);

function cerrar() {
  emit('update:modelValue', false);
  emit('close');
}

function onKeydown(event) {
  if (event.key === 'Escape') {
    cerrar();
  }
}

watch(
  () => props.modelValue,
  (abierto) => {
    if (abierto) {
      document.addEventListener('keydown', onKeydown);
    } else {
      document.removeEventListener('keydown', onKeydown);
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown));
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 30, 45, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 2rem 1rem;
  overflow-y: auto;
  z-index: 500;
}

.modal {
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  width: 100%;
  max-width: 560px;
}

.modal-lg {
  max-width: 820px;
}

.modal-sm {
  max-width: 420px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
}

.modal-header h2 {
  margin: 0;
}

.modal-close {
  border: none;
  background: none;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  color: var(--color-muted);
}

.modal-body {
  padding: 1.25rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--color-border);
}
</style>
