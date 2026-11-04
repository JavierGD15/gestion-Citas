<template>
  <span class="badge" :class="`badge-${tono}`">{{ etiqueta }}</span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  estado: { type: String, required: true },
  etiquetas: { type: Object, default: () => ({}) }
});

const TONOS = {
  ACTIVO: 'success',
  INACTIVO: 'muted',
  PENDIENTE: 'warning',
  CONFIRMADA: 'info',
  COMPLETADA: 'success',
  CANCELADA: 'danger',
  ATENDIDA: 'success',
  RECHAZADA: 'danger',
  REGISTRADO: 'success',
  ANULADO: 'danger',
  PARCIAL: 'info',
  PAGADO: 'success',
  ABIERTA: 'success',
  CERRADA: 'muted',
  LEIDO: 'muted',
  NUEVO: 'info'
};

const tono = computed(() => TONOS[props.estado] || 'muted');
const etiqueta = computed(() => props.etiquetas[props.estado] || props.estado.replaceAll('_', ' '));
</script>

<style scoped>
.badge {
  display: inline-block;
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.badge-success {
  background: var(--color-success-soft);
  color: var(--color-success);
}

.badge-warning {
  background: var(--color-warning-soft);
  color: var(--color-warning);
}

.badge-danger {
  background: var(--color-danger-soft);
  color: var(--color-danger);
}

.badge-info {
  background: var(--color-info-soft);
  color: var(--color-info);
}

.badge-muted {
  background: var(--color-surface-alt);
  color: var(--color-muted);
  border: 1px solid var(--color-border);
}
</style>
