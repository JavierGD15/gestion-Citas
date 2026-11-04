<template>
  <section class="container page">
    <h1>Corporativo</h1>
    <p class="text-muted">Capacitaciones, escuela para padres y actividades de nuestro centro.</p>

    <div v-for="grupo in grupos" :key="grupo.categoria" class="grupo">
      <h2>{{ grupo.titulo }}</h2>
      <div class="actividades">
        <article v-for="item in grupo.items" :key="item._id" class="card actividad">
          <h3>{{ item.titulo }}</h3>
          <p>{{ item.descripcion }}</p>
          <div v-if="imagenesDe(item).length" class="galeria">
            <img v-for="(imagen, indice) in imagenesDe(item)" :key="indice" :src="imagen" :alt="`${item.titulo} ${indice + 1}`" loading="lazy" />
          </div>
        </article>
      </div>
    </div>
    <p v-if="grupos.length === 0" class="text-muted">Pronto compartiremos nuestras actividades.</p>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useSitioStore } from '@/stores/sitio';

const sitio = useSitioStore();

const CATEGORIAS = [
  { categoria: 'CAPACITACION', titulo: 'Capacitaciones' },
  { categoria: 'ESCUELA_PADRES', titulo: 'Escuela para padres' },
  { categoria: 'ACTIVIDAD', titulo: 'Actividades' }
];

const grupos = computed(() => {
  const items = sitio.contenido?.corporativo || [];
  return CATEGORIAS.map((grupo) => ({ ...grupo, items: items.filter((item) => item.categoria === grupo.categoria) })).filter(
    (grupo) => grupo.items.length > 0
  );
});

const imagenesDe = (item) => [item.imagen, ...(item.imagenes || [])].filter(Boolean);
</script>

<style scoped>
.page {
  padding-block: 2rem;
}

.grupo {
  margin-top: 2rem;
}

.actividades {
  display: grid;
  gap: 1rem;
}

.actividad p {
  white-space: pre-line;
}

.galeria {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.5rem;
}

.galeria img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: var(--radius-sm);
}
</style>
