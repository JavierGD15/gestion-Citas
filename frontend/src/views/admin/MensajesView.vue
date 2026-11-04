<template>
  <section>
    <div class="page-header">
      <h1>Mensajes de contacto</h1>
    </div>

    <div class="card">
      <form class="toolbar" @submit.prevent="buscar">
        <FormField id="filtro-leido" label="Estado">
          <select id="filtro-leido" v-model="filtros.leido">
            <option value="">Todos</option>
            <option value="false">No leídos</option>
            <option value="true">Leídos</option>
          </select>
        </FormField>
        <button type="submit" class="btn btn-secondary">Filtrar</button>
      </form>

      <div class="mensajes">
        <article v-for="mensaje in items" :key="mensaje._id" class="mensaje" :class="{ nuevo: !mensaje.leido }">
          <header>
            <div>
              <strong>{{ mensaje.asunto }}</strong>
              <div class="text-muted">{{ mensaje.nombre }} · {{ mensaje.correo }} · {{ mensaje.telefono }}</div>
            </div>
            <div class="meta">
              <small class="text-muted">{{ formatearFechaHora(mensaje.createdAt) }}</small>
              <StatusBadge :estado="mensaje.leido ? 'LEIDO' : 'NUEVO'" :etiquetas="{ LEIDO: 'Leído', NUEVO: 'Nuevo' }" />
            </div>
          </header>
          <p>{{ mensaje.mensaje }}</p>
          <footer>
            <small v-if="mensaje.leido" class="text-muted">
              Leído por {{ mensaje.leidoPor?.nombres }} {{ mensaje.leidoPor?.apellidos }} · {{ formatearFechaHora(mensaje.fechaLectura) }}
            </small>
            <button v-else type="button" class="btn btn-secondary btn-sm" @click="marcar(mensaje)">Marcar como leído</button>
          </footer>
        </article>
        <p v-if="!cargando && items.length === 0" class="text-muted">No hay mensajes</p>
      </div>
      <PaginationBar :meta="meta" @change="cargar" />
    </div>
  </section>
</template>

<script setup>
import { onMounted } from 'vue';
import FormField from '@/components/common/FormField.vue';
import PaginationBar from '@/components/common/PaginationBar.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { useListado } from '@/composables/useListado';
import contenidoService from '@/services/contenido.service';
import { useNotificationsStore } from '@/stores/notifications';
import { mensajeError } from '@/utils/errors';
import { formatearFechaHora } from '@/utils/format';

const notifications = useNotificationsStore();
const { items, meta, cargando, filtros, cargar, buscar } = useListado(contenidoService.mensajes, { leido: '' });

async function marcar(mensaje) {
  try {
    await contenidoService.marcarLeido(mensaje._id);
    cargar();
  } catch (error) {
    notifications.error(mensajeError(error));
  }
}

onMounted(() => cargar(1));
</script>

<style scoped>
.mensajes {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.mensaje {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 1rem;
}

.mensaje.nuevo {
  border-left: 4px solid var(--color-info);
}

.mensaje header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.mensaje p {
  white-space: pre-line;
}
</style>
