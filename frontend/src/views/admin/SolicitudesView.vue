<template>
  <section>
    <div class="page-header">
      <h1>Solicitudes de cita</h1>
    </div>

    <div class="card">
      <form class="toolbar" @submit.prevent="buscar">
        <FormField id="filtro-q" label="Buscar">
          <input id="filtro-q" v-model.trim="filtros.q" type="search" placeholder="Solicitante, correo o teléfono" />
        </FormField>
        <FormField id="filtro-estado" label="Estado">
          <select id="filtro-estado" v-model="filtros.estado">
            <option value="">Todos</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="ATENDIDA">Atendida</option>
            <option value="RECHAZADA">Rechazada</option>
          </select>
        </FormField>
        <button type="submit" class="btn btn-secondary">Filtrar</button>
      </form>

      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>Recibida</th>
              <th>Solicitante</th>
              <th>Servicio</th>
              <th>Fecha preferida</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="solicitud in items" :key="solicitud._id">
              <td>{{ formatearFechaHora(solicitud.createdAt) }}</td>
              <td>
                <strong>{{ solicitud.nombreSolicitante }}</strong>
                <div class="text-muted">{{ solicitud.telefono }} · {{ solicitud.correo }}</div>
              </td>
              <td>{{ solicitud.servicio?.nombre }}</td>
              <td>{{ formatearFecha(solicitud.fechaPreferida) }}</td>
              <td><StatusBadge :estado="solicitud.estado" /></td>
              <td>
                <div class="actions">
                  <button type="button" class="btn btn-secondary btn-sm" @click="verDetalle(solicitud)">Ver</button>
                  <button v-if="solicitud.estado === 'PENDIENTE'" type="button" class="btn btn-danger btn-sm" @click="abrirRechazo(solicitud)">Rechazar</button>
                </div>
              </td>
            </tr>
            <tr v-if="!cargando && items.length === 0">
              <td colspan="6" class="text-muted">No hay solicitudes</td>
            </tr>
          </tbody>
        </table>
      </div>
      <PaginationBar :meta="meta" @change="cargar" />
    </div>

    <BaseModal v-model="mostrarDetalle" title="Detalle de la solicitud">
      <dl v-if="seleccionada" class="detail-list">
        <dt>Solicitante</dt>
        <dd>{{ seleccionada.nombreSolicitante }}</dd>
        <dt>Correo</dt>
        <dd>{{ seleccionada.correo }}</dd>
        <dt>Teléfono</dt>
        <dd>{{ seleccionada.telefono }}</dd>
        <dt>Servicio</dt>
        <dd>{{ seleccionada.servicio?.nombre }}</dd>
        <dt>Fecha preferida</dt>
        <dd>{{ formatearFechaLarga(seleccionada.fechaPreferida) }}</dd>
        <dt>Mensaje</dt>
        <dd>{{ seleccionada.mensaje || 'Sin mensaje' }}</dd>
        <dt>Estado</dt>
        <dd><StatusBadge :estado="seleccionada.estado" /></dd>
        <template v-if="seleccionada.estado !== 'PENDIENTE'">
          <dt>Atendida por</dt>
          <dd>{{ seleccionada.atendidaPor?.nombres }} {{ seleccionada.atendidaPor?.apellidos }} · {{ formatearFechaHora(seleccionada.fechaAtencion) }}</dd>
        </template>
        <template v-if="seleccionada.motivoRechazo">
          <dt>Motivo de rechazo</dt>
          <dd>{{ seleccionada.motivoRechazo }}</dd>
        </template>
        <template v-if="seleccionada.cita">
          <dt>Cita generada</dt>
          <dd>{{ seleccionada.cita.codigo }} · {{ formatearFecha(seleccionada.cita.fecha) }} {{ seleccionada.cita.horaInicio }}</dd>
        </template>
      </dl>
    </BaseModal>

    <ConfirmDialog
      v-model="mostrarRechazo"
      title="Rechazar solicitud"
      :message="`¿Desea rechazar la solicitud de ${seleccionada?.nombreSolicitante}?`"
      confirm-text="Rechazar"
      danger
      require-reason
      reason-label="Motivo del rechazo"
      :loading="procesando"
      @confirm="rechazar"
    />
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import BaseModal from '@/components/common/BaseModal.vue';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
import FormField from '@/components/common/FormField.vue';
import PaginationBar from '@/components/common/PaginationBar.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { useListado } from '@/composables/useListado';
import solicitudesService from '@/services/solicitudes.service';
import { useNotificationsStore } from '@/stores/notifications';
import { mensajeError } from '@/utils/errors';
import { formatearFecha, formatearFechaHora, formatearFechaLarga } from '@/utils/format';

const notifications = useNotificationsStore();
const { items, meta, cargando, filtros, cargar, buscar } = useListado(solicitudesService.listar, { q: '', estado: 'PENDIENTE' });

const seleccionada = ref(null);
const mostrarDetalle = ref(false);
const mostrarRechazo = ref(false);
const procesando = ref(false);

function verDetalle(solicitud) {
  seleccionada.value = solicitud;
  mostrarDetalle.value = true;
}

function abrirRechazo(solicitud) {
  seleccionada.value = solicitud;
  mostrarRechazo.value = true;
}

async function rechazar(motivo) {
  procesando.value = true;
  try {
    await solicitudesService.rechazar(seleccionada.value._id, motivo);
    notifications.exito('Solicitud rechazada');
    mostrarRechazo.value = false;
    cargar();
  } catch (error) {
    notifications.error(mensajeError(error));
  } finally {
    procesando.value = false;
  }
}

onMounted(() => cargar(1));
</script>
