<template>
  <section v-if="caja">
    <div class="page-header">
      <div>
        <h1>Caja {{ caja.codigo }} <StatusBadge :estado="caja.estado" /></h1>
        <p class="text-muted">
          Responsable: {{ caja.usuario?.nombres }} {{ caja.usuario?.apellidos }} · Apertura {{ formatearFechaHora(caja.fechaApertura) }}
          <template v-if="caja.fechaCierre"> · Cierre {{ formatearFechaHora(caja.fechaCierre) }} por {{ caja.cerradoPor?.nombres }} {{ caja.cerradoPor?.apellidos }}</template>
        </p>
      </div>
      <div class="actions">
        <RouterLink :to="{ name: 'admin-cajas' }" class="btn btn-secondary">Volver</RouterLink>
        <button type="button" class="btn btn-primary" @click="imprimir">Imprimir cierre</button>
      </div>
    </div>

    <p v-if="caja.observacionesApertura" class="alert alert-info obs">Apertura: {{ caja.observacionesApertura }}</p>
    <p v-if="caja.observacionesCierre" class="alert alert-info obs">Cierre: {{ caja.observacionesCierre }}</p>

    <ResumenCaja :resumen="caja.resumen" />
    <MovimientosCaja class="movimientos" :caja-id="caja._id" />
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MovimientosCaja from '@/components/admin/MovimientosCaja.vue';
import ResumenCaja from '@/components/admin/ResumenCaja.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import cajasService from '@/services/cajas.service';
import { useNotificationsStore } from '@/stores/notifications';
import { mensajeError } from '@/utils/errors';
import { formatearFechaHora } from '@/utils/format';

const route = useRoute();
const router = useRouter();
const notifications = useNotificationsStore();
const caja = ref(null);

function imprimir() {
  window.print();
}

onMounted(async () => {
  try {
    caja.value = await cajasService.obtener(route.params.id);
  } catch (error) {
    notifications.error(mensajeError(error));
    router.replace({ name: 'admin-cajas' });
  }
});
</script>

<style scoped>
h1 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.obs {
  margin-bottom: 1rem;
}

.movimientos {
  margin-top: 1rem;
}
</style>
