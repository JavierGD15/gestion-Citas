<template>
  <section v-if="paciente">
    <div class="page-header">
      <div class="encabezado">
        <AvatarImg :src="paciente.fotografia" :nombre="paciente.nombreCompleto" :size="64" />
        <div>
          <h1>{{ paciente.nombreCompleto }}</h1>
          <p class="text-muted">{{ paciente.codigo }} · {{ paciente.edad }} años · <StatusBadge :estado="paciente.estado" /></p>
        </div>
      </div>
      <div class="actions">
        <RouterLink :to="{ name: 'admin-pacientes' }" class="btn btn-secondary">Volver</RouterLink>
        <button v-if="puedeEditar" type="button" class="btn btn-primary" @click="mostrarFormulario = true">Editar</button>
      </div>
    </div>

    <div class="tabs">
      <button v-for="tab in tabs" :key="tab.id" type="button" :class="{ active: tabActiva === tab.id }" @click="tabActiva = tab.id">
        {{ tab.titulo }}
      </button>
    </div>

    <div v-if="tabActiva === 'datos'" class="card">
      <dl class="detail-list">
        <dt>Fecha de nacimiento</dt>
        <dd>{{ formatearFecha(paciente.fechaNacimiento) }} ({{ paciente.edad }} años)</dd>
        <dt>Sexo</dt>
        <dd>{{ SEXOS[paciente.sexo] }}</dd>
        <dt>Teléfono</dt>
        <dd>{{ paciente.telefono }}</dd>
        <dt>Dirección</dt>
        <dd>{{ paciente.direccion }}</dd>
        <dt>Inicio del proceso</dt>
        <dd>{{ formatearFecha(paciente.fechaInicioProceso) }}</dd>
        <dt>Observaciones</dt>
        <dd>{{ paciente.observaciones || 'Sin observaciones' }}</dd>
        <dt>Registrado</dt>
        <dd>{{ formatearFechaHora(paciente.createdAt) }}</dd>
      </dl>
    </div>

    <PacienteResponsables v-if="tabActiva === 'responsables'" :paciente="paciente" :editable="puedeEditar" />

    <PacienteForm v-model="mostrarFormulario" :paciente="paciente" @saved="cargar" />
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PacienteForm from '@/components/admin/PacienteForm.vue';
import PacienteResponsables from '@/components/admin/PacienteResponsables.vue';
import AvatarImg from '@/components/common/AvatarImg.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import pacientesService from '@/services/pacientes.service';
import { useAuthStore } from '@/stores/auth';
import { useNotificationsStore } from '@/stores/notifications';
import { SEXOS } from '@/utils/catalogos';
import { mensajeError } from '@/utils/errors';
import { formatearFecha, formatearFechaHora } from '@/utils/format';
import { ROLES } from '@/utils/roles';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const notifications = useNotificationsStore();

const paciente = ref(null);
const mostrarFormulario = ref(false);
const tabActiva = ref('datos');

const puedeEditar = computed(() => auth.tieneRol(ROLES.ADMINISTRADOR, ROLES.RECEPCIONISTA));

const tabs = computed(() => [
  { id: 'datos', titulo: 'Datos generales' },
  { id: 'responsables', titulo: 'Responsables' }
]);

async function cargar() {
  try {
    paciente.value = await pacientesService.obtener(route.params.id);
  } catch (error) {
    notifications.error(mensajeError(error));
    router.replace({ name: 'admin-pacientes' });
  }
}

onMounted(cargar);
</script>

<style scoped>
.encabezado {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.encabezado p {
  margin: 0.25rem 0 0;
}
</style>
