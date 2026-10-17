<template>
  <section class="container page">
    <h1>Misión y visión</h1>
    <div class="grid-2">
      <article v-for="item in bloques" :key="item.clave" class="card bloque">
        <img v-if="item.imagen" :src="item.imagen" :alt="item.titulo" />
        <h2>{{ item.titulo }}</h2>
        <p>{{ item.descripcion }}</p>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useSitioStore } from '@/stores/sitio';

const sitio = useSitioStore();

const bloques = computed(() =>
  [sitio.contenido?.mision, sitio.contenido?.vision].filter(Boolean)
);
</script>

<style scoped>
.page {
  padding-block: 2rem;
}

.bloque img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: var(--radius-sm);
  margin-bottom: 1rem;
}

.bloque p {
  white-space: pre-line;
}
</style>
