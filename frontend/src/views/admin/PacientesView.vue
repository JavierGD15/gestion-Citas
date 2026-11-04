<template>
  <section>
    <div class="page-header">
      <h1>Pacientes</h1>
      <button type="button" class="btn btn-primary" @click="abrirFormulario()">Registrar paciente</button>
    </div>

    <div class="card">
      <form class="toolbar" @submit.prevent="buscar">
        <FormField id="filtro-q" label="Buscar">
          <input id="filtro-q" v-model.trim="filtros.q" type="search" placeholder="Nombre, código o teléfono" />
        </FormField>
        <FormField id="filtro-estado" label="Estado">
          <select id="filtro-estado" v-model="filtros.estado">
            <option value="">Todos</option>
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
          </select>
        </FormField>
        <button type="submit" class="btn btn-secondary">Buscar</button>
      </form>

      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Código</th>
              <th>Edad</th>
              <th>Teléfono</th>
              <th>Inicio del proceso</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="paciente in items" :key="paciente._id">
              <td>
                <div class="persona">
                  <AvatarImg :src="paciente.fotografia" :nombre="paciente.nombreCompleto" />
                  <RouterLink :to="{ name: 'admin-paciente-detalle', params: { id: paciente._id } }">{{ paciente.nombreCompleto }}</RouterLink>
                </div>
              </td>
              <td>{{ paciente.codigo }}</td>
              <td>{{ paciente.edad }} años</td>
              <td>{{ paciente.telefono }}</td>
              <td>{{ formatearFecha(paciente.fechaInicioProceso) }}</td>
              <td><StatusBadge :estado="paciente.estado" /></td>
              <td>
                <div class="actions">
                  <RouterLink :to="{ name: 'admin-paciente-detalle', params: { id: paciente._id } }" class="btn btn-secondary btn-sm">Ver</RouterLink>
                  <button type="button" class="btn btn-secondary btn-sm" @click="abrirFormulario(paciente)">Editar</button>
                  <button
                    type="button"
                    class="btn btn-sm"
                    :class="paciente.estado === 'ACTIVO' ? 'btn-danger' : 'btn-success'"
                    @click="alternarEstado(paciente)"
                  >
                    {{ paciente.estado === 'ACTIVO' ? 'Desactivar' : 'Activar' }}
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!cargando && items.length === 0">
              <td colspan="7" class="text-muted">No se encontraron pacientes</td>
            </tr>
          </tbody>
        </table>
      </div>
      <PaginationBar :meta="meta" @change="cargar" />
    </div>

    <PacienteForm v-model="mostrarFormulario" :paciente="seleccionado" @saved="cargar()" />
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import PacienteForm from '@/components/admin/PacienteForm.vue';
import AvatarImg from '@/components/common/AvatarImg.vue';
import FormField from '@/components/common/FormField.vue';
import PaginationBar from '@/components/common/PaginationBar.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { useListado } from '@/composables/useListado';
import pacientesService from '@/services/pacientes.service';
import { useNotificationsStore } from '@/stores/notifications';
import { mensajeError } from '@/utils/errors';
import { formatearFecha } from '@/utils/format';

const notifications = useNotificationsStore();
const { items, meta, cargando, filtros, cargar, buscar } = useListado(pacientesService.listar, { q: '', estado: '' });

const mostrarFormulario = ref(false);
const seleccionado = ref(null);

function abrirFormulario(paciente = null) {
  seleccionado.value = paciente;
  mostrarFormulario.value = true;
}

async function alternarEstado(paciente) {
  const estado = paciente.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
  try {
    await pacientesService.cambiarEstado(paciente._id, estado);
    notifications.exito(`Paciente ${estado === 'ACTIVO' ? 'activado' : 'desactivado'} correctamente`);
    cargar();
  } catch (error) {
    notifications.error(mensajeError(error));
  }
}

onMounted(() => cargar(1));
</script>

<style scoped>
.persona {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 600;
}
</style>
