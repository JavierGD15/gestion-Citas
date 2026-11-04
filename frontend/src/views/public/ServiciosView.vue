<template>
  <section class="container page">
    <h1>Servicios</h1>
    <p class="text-muted">Conozca los servicios que ofrecemos para el acompañamiento de pacientes y familias.</p>
    <div class="grid-3">
      <ServiceCard v-for="servicio in servicios" :key="servicio._id" :servicio="servicio">
        <RouterLink
          v-if="router.hasRoute('solicitar-cita')"
          :to="{ name: 'solicitar-cita', query: { servicio: servicio._id } }"
          class="btn btn-primary"
        >
          Solicitar cita
        </RouterLink>
      </ServiceCard>
    </div>
    <p v-if="!cargando && servicios.length === 0" class="text-muted">No hay servicios disponibles en este momento.</p>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import ServiceCard from '@/components/public/ServiceCard.vue';
import portalService from '@/services/portal.service';

const router = useRouter();
const servicios = ref([]);
const cargando = ref(true);

onMounted(async () => {
  try {
    servicios.value = await portalService.servicios();
  } finally {
    cargando.value = false;
  }
});
</script>

<style scoped>
.page {
  padding-block: 2rem;
}
</style>
