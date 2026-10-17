<template>
  <article class="service-card">
    <img v-if="servicio.imagen" :src="servicio.imagen" :alt="servicio.nombre" />
    <div v-else class="service-placeholder">{{ servicio.nombre.charAt(0) }}</div>
    <div class="service-body">
      <h3>{{ servicio.nombre }}</h3>
      <p>{{ servicio.descripcion }}</p>
      <div class="service-meta">
        <span>Duración estimada: {{ servicio.duracionMinutos }} min</span>
      </div>
      <slot />
    </div>
  </article>
</template>

<script setup>
defineProps({
  servicio: { type: Object, required: true }
});
</script>

<style scoped>
.service-card {
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow);
}

.service-card img,
.service-placeholder {
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
}

.service-placeholder {
  display: grid;
  place-items: center;
  font-size: 3rem;
  font-weight: 800;
  color: var(--color-primary);
  background: var(--color-primary-soft);
}

.service-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 1.25rem 1.25rem;
  flex: 1;
}

.service-body h3 {
  margin: 0;
}

.service-body p {
  margin: 0;
  color: var(--color-muted);
  flex: 1;
}

.service-meta {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-primary);
}
</style>
