<template>
  <div class="toasts" aria-live="polite">
    <TransitionGroup name="toast">
      <div v-for="item in notifications.items" :key="item.id" class="toast" :class="`toast-${item.tipo}`" role="status">
        <span>{{ item.mensaje }}</span>
        <button type="button" class="toast-close" aria-label="Cerrar" @click="notifications.remover(item.id)">×</button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useNotificationsStore } from '@/stores/notifications';

const notifications = useNotificationsStore();
</script>

<style scoped>
.toasts {
  position: fixed;
  top: 1rem;
  right: 1rem;
  left: 1rem;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  z-index: 1000;
  pointer-events: none;
}

.toast {
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  max-width: 420px;
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  background: var(--color-surface);
  border-left: 4px solid var(--color-primary);
}

.toast-exito {
  border-left-color: var(--color-success);
}

.toast-error {
  border-left-color: var(--color-danger);
}

.toast span {
  flex: 1;
}

.toast-close {
  border: none;
  background: transparent;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  color: var(--color-muted);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
