<template>
  <div>
    <section class="container hero">
      <ImageCarousel :slides="slides" />
    </section>

    <section class="container intro">
      <h1>{{ sitio.nombreCentro }}</h1>
      <p class="eslogan">{{ sitio.general.eslogan }}</p>
      <p class="text-muted">{{ sitio.contenido?.general?.descripcion }}</p>
    </section>

    <section class="container section">
      <div class="section-header">
        <h2>Nuestros servicios</h2>
        <RouterLink :to="{ name: 'servicios' }">Ver todos</RouterLink>
      </div>
      <div class="grid-3">
        <ServiceCard v-for="servicio in servicios.slice(0, 3)" :key="servicio._id" :servicio="servicio" />
      </div>
      <p v-if="servicios.length === 0" class="text-muted">Pronto publicaremos nuestros servicios.</p>
    </section>

    <section class="container section">
      <div class="grid-2">
        <article class="card highlight">
          <h2>{{ sitio.contenido?.mision?.titulo || 'Misión' }}</h2>
          <p>{{ sitio.contenido?.mision?.descripcion }}</p>
        </article>
        <article class="card highlight">
          <h2>{{ sitio.contenido?.vision?.titulo || 'Visión' }}</h2>
          <p>{{ sitio.contenido?.vision?.descripcion }}</p>
        </article>
      </div>
    </section>

    <section class="container section">
      <div class="quick-links">
        <RouterLink v-for="acceso in accesos" :key="acceso.ruta" :to="{ name: acceso.ruta }" class="card quick-link">
          <strong>{{ acceso.titulo }}</strong>
          <span class="text-muted">{{ acceso.texto }}</span>
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import ImageCarousel from '@/components/public/ImageCarousel.vue';
import ServiceCard from '@/components/public/ServiceCard.vue';
import portalService from '@/services/portal.service';
import { useSitioStore } from '@/stores/sitio';

const sitio = useSitioStore();
const servicios = ref([]);

const slides = computed(() => {
  const carrusel = sitio.general.carrusel || [];
  return carrusel.length > 0 ? carrusel : [{ titulo: sitio.nombreCentro, descripcion: sitio.general.eslogan }];
});

const accesos = [
  { titulo: 'Contenido educativo', texto: 'Artículos y recursos para familias', ruta: 'educativo' },
  { titulo: 'Corporativo', texto: 'Capacitaciones y escuela para padres', ruta: 'corporativo' },
  { titulo: 'Horarios', texto: 'Días y horas de atención', ruta: 'horarios' },
  { titulo: 'Contacto', texto: 'Escríbanos sus consultas', ruta: 'contacto' }
];

onMounted(async () => {
  try {
    servicios.value = await portalService.servicios();
  } catch {
    servicios.value = [];
  }
});
</script>

<style scoped>
.hero {
  padding-top: 1.5rem;
}

.intro {
  text-align: center;
  padding-block: 2rem 1rem;
  max-width: 820px;
}

.intro h1 {
  font-size: clamp(1.6rem, 4vw, 2.4rem);
  margin-bottom: 0.25rem;
  color: var(--color-primary-dark);
}

.eslogan {
  font-size: 1.15rem;
  color: var(--color-primary);
  font-weight: 600;
  margin-top: 0;
}

.section {
  padding-block: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 1rem;
}

.section-header h2 {
  margin: 0;
}

.highlight {
  border-top: 4px solid var(--color-primary);
}

.quick-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.quick-link {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  color: var(--color-text);
  transition: transform 0.15s ease;
}

.quick-link:hover {
  transform: translateY(-2px);
}
</style>
