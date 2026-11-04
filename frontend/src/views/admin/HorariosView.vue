<template>
  <section>
    <div class="page-header">
      <h1>Horarios de atención</h1>
      <RouterLink v-if="esAdmin" :to="{ name: 'admin-contenido' }" class="btn btn-secondary">Editar horarios</RouterLink>
    </div>

    <div class="card horarios">
      <div v-for="horario in horarios" :key="horario._id" class="horario" :class="{ cerrado: !horario.activo }">
        <strong>{{ horario.nombreDia }}</strong>
        <span>{{ horario.activo ? `${horario.horaInicio} – ${horario.horaFin}` : 'Cerrado' }}</span>
      </div>
      <p v-if="!cargando && horarios.length === 0" class="horario text-muted">No hay horarios configurados</p>
    </div>
    <p class="text-muted nota">Las citas solo pueden programarse dentro de estos horarios.</p>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import portalService from '@/services/portal.service';
import { useAuthStore } from '@/stores/auth';
import { useNotificationsStore } from '@/stores/notifications';
import { mensajeError } from '@/utils/errors';
import { ROLES } from '@/utils/roles';

const auth = useAuthStore();
const notifications = useNotificationsStore();
const esAdmin = computed(() => auth.tieneRol(ROLES.ADMINISTRADOR));

const horarios = ref([]);
const cargando = ref(false);

onMounted(async () => {
  cargando.value = true;
  try {
    horarios.value = await portalService.horarios();
  } catch (error) {
    notifications.error(mensajeError(error));
  } finally {
    cargando.value = false;
  }
});
</script>

<style scoped>
.horarios {
  padding: 0;
  max-width: 640px;
}

.horario {
  display: flex;
  justify-content: space-between;
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
  margin: 0;
}

.horario:last-child {
  border-bottom: none;
}

.cerrado {
  color: var(--color-muted);
}

.nota {
  margin-top: 1rem;
}
</style>
