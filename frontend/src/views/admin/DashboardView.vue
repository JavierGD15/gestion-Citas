<template>
  <section>
    <div class="page-header">
      <div>
        <h1>Hola, {{ auth.usuario?.nombres }}</h1>
        <p class="text-muted">{{ ETIQUETAS_ROL[auth.rol] }} · {{ formatearFechaLarga(hoy) }}</p>
      </div>
    </div>

    <div class="grid-3 indicadores">
      <div v-for="(etiqueta, estado) in ESTADOS_CITA" :key="estado" class="card stat-card">
        <span class="stat-label">Citas de hoy · {{ etiqueta }}</span>
        <span class="stat-value">{{ conteo[estado] || 0 }}</span>
      </div>
      <RouterLink v-if="puedeGestionar" :to="{ name: 'admin-solicitudes' }" class="card stat-card enlace">
        <span class="stat-label">Solicitudes pendientes</span>
        <span class="stat-value">{{ solicitudesPendientes }}</span>
      </RouterLink>
    </div>

    <div v-if="puedeGestionar" class="card caja-resumen">
      <div class="section-header">
        <h2>Resumen de caja diaria</h2>
        <RouterLink :to="{ name: 'admin-caja' }">{{ caja.abierta ? 'Ir a caja' : 'Abrir caja' }}</RouterLink>
      </div>
      <ResumenCaja v-if="caja.abierta" :resumen="caja.actual.resumen" />
      <p v-else-if="caja.cargada" class="text-muted">No tiene una caja abierta. Abra una caja para registrar pagos.</p>
    </div>

    <div class="card">
      <div class="section-header">
        <h2>{{ esProfesional ? 'Mis citas de hoy' : 'Citas de hoy' }}</h2>
        <RouterLink :to="{ name: 'admin-calendario' }">Ver calendario</RouterLink>
      </div>
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>Horario</th>
              <th>Paciente</th>
              <th>Servicio</th>
              <th v-if="!esProfesional">Profesional</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cita in citasHoy" :key="cita._id">
              <td>
                <RouterLink :to="{ name: 'admin-cita-detalle', params: { id: cita._id } }">{{ cita.horaInicio }} – {{ cita.horaFin }}</RouterLink>
              </td>
              <td>{{ cita.paciente?.nombres }} {{ cita.paciente?.apellidos }}</td>
              <td>{{ cita.servicio?.nombre }}</td>
              <td v-if="!esProfesional">{{ cita.profesional?.nombreCompleto }}</td>
              <td><StatusBadge :estado="cita.estado" :etiquetas="ESTADOS_CITA" /></td>
            </tr>
            <tr v-if="citasHoy.length === 0">
              <td :colspan="esProfesional ? 4 : 5" class="text-muted">No hay citas programadas para hoy</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import ResumenCaja from '@/components/admin/ResumenCaja.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import citasService from '@/services/citas.service';
import solicitudesService from '@/services/solicitudes.service';
import { useAuthStore } from '@/stores/auth';
import { useCajaStore } from '@/stores/caja';
import { ESTADOS_CITA } from '@/utils/catalogos';
import { fechaISO, formatearFechaLarga } from '@/utils/format';
import { ETIQUETAS_ROL, ROLES } from '@/utils/roles';

const auth = useAuthStore();
const caja = useCajaStore();
const hoy = fechaISO();
const esProfesional = computed(() => auth.tieneRol(ROLES.PROFESIONAL));
const puedeGestionar = computed(() => auth.tieneRol(ROLES.ADMINISTRADOR, ROLES.RECEPCIONISTA));

const citasHoy = ref([]);
const solicitudesPendientes = ref(0);

const conteo = computed(() =>
  citasHoy.value.reduce((acc, cita) => {
    acc[cita.estado] = (acc[cita.estado] || 0) + 1;
    return acc;
  }, {})
);

onMounted(async () => {
  try {
    citasHoy.value = (await citasService.listar({ fecha: hoy, orden: 'asc', limit: 100 })).data;
  } catch {
    citasHoy.value = [];
  }
  if (puedeGestionar.value) {
    caja.cargarActual().catch(() => {});
    try {
      solicitudesPendientes.value = (await solicitudesService.listar({ estado: 'PENDIENTE', limit: 1 })).meta.total;
    } catch {
      solicitudesPendientes.value = 0;
    }
  }
});
</script>

<style scoped>
.indicadores {
  margin-bottom: 1rem;
}

.caja-resumen {
  margin-bottom: 1rem;
}

.enlace {
  color: var(--color-text);
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
</style>
