<template>
  <section class="container page">
    <h1>Contenido educativo</h1>
    <p class="text-muted">Publicaciones informativas para pacientes, familias y comunidad.</p>
    <div class="publicaciones">
      <article v-for="item in publicaciones" :key="item._id" class="card publicacion">
        <img v-if="item.imagen" :src="item.imagen" :alt="item.titulo" loading="lazy" />
        <div class="publicacion-body">
          <small class="text-muted">{{ formatearFechaLarga(item.fechaPublicacion || item.createdAt) }}</small>
          <h2>{{ item.titulo }}</h2>
          <p>{{ item.descripcion }}</p>
          <a v-if="item.enlace" :href="item.enlace" target="_blank" rel="noopener noreferrer">Leer más</a>
        </div>
      </article>
    </div>
    <p v-if="publicaciones.length === 0" class="text-muted">Aún no hay publicaciones.</p>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useSitioStore } from '@/stores/sitio';
import { formatearFechaLarga } from '@/utils/format';

const sitio = useSitioStore();
const publicaciones = computed(() => sitio.contenido?.educativo || []);
</script>

<style scoped>
.page {
  padding-block: 2rem;
}

.publicaciones {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.publicacion {
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.publicacion img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

.publicacion-body {
  padding: 1rem 1.25rem 1.25rem;
}

.publicacion-body h2 {
  margin: 0.25rem 0 0.5rem;
}

.publicacion-body p {
  white-space: pre-line;
}
</style>
