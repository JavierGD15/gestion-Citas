<template>
  <section v-if="cita">
    <div class="page-header">
      <div>
        <h1>Cita {{ cita.codigo }}</h1>
        <p class="text-muted subtitulo">
          <StatusBadge :estado="cita.estado" :etiquetas="ESTADOS_CITA" />
          {{ formatearFechaLarga(cita.fecha) }} · {{ cita.horaInicio }} – {{ cita.horaFin }}
        </p>
      </div>
      <div class="actions">
        <RouterLink :to="{ name: 'admin-citas' }" class="btn btn-secondary">Volver</RouterLink>
        <template v-if="puedeGestionar">
          <button v-if="cita.estado === 'PENDIENTE'" type="button" class="btn btn-primary" @click="cambiar('CONFIRMADA')">Confirmar</button>
          <button v-if="activa" type="button" class="btn btn-secondary" @click="mostrarReprogramar = true">Reprogramar</button>
          <button v-if="activa" type="button" class="btn btn-danger" @click="mostrarCancelar = true">Cancelar</button>
        </template>
        <button v-if="cita.estado === 'CONFIRMADA'" type="button" class="btn btn-success" @click="cambiar('COMPLETADA')">Marcar completada</button>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <h2>Información de la cita</h2>
        <dl class="detail-list">
          <dt>Paciente</dt>
          <dd>
            <RouterLink :to="{ name: 'admin-paciente-detalle', params: { id: cita.paciente._id } }">
              {{ cita.paciente.nombres }} {{ cita.paciente.apellidos }}
            </RouterLink>
            <span class="text-muted"> · {{ cita.paciente.codigo }}</span>
          </dd>
          <dt>Servicio</dt>
          <dd>{{ cita.servicio.nombre }}</dd>
          <dt>Profesional</dt>
          <dd>{{ cita.profesional.nombreCompleto }} · {{ cita.profesional.especialidad }}</dd>
          <dt>Fecha</dt>
          <dd>{{ formatearFechaLarga(cita.fecha) }}</dd>
          <dt>Horario</dt>
          <dd>{{ cita.horaInicio }} – {{ cita.horaFin }} ({{ cita.duracionMinutos }} min)</dd>
          <dt>Precio registrado</dt>
          <dd>{{ formatearMoneda(cita.precio) }}</dd>
          <template v-if="cita.finanzas && puedeGestionar">
            <dt>Estado financiero</dt>
            <dd>
              <StatusBadge :estado="cita.finanzas.estadoFinanciero" :etiquetas="ESTADOS_FINANCIEROS" financiero />
              <span class="text-muted"> Saldo {{ formatearMoneda(cita.finanzas.saldo) }}</span>
            </dd>
          </template>
          <dt>Creada</dt>
          <dd>{{ formatearFechaHora(cita.createdAt) }} por {{ cita.creadoPor?.nombres }} {{ cita.creadoPor?.apellidos }}</dd>
          <template v-if="cita.motivoCancelacion">
            <dt>Motivo de cancelación</dt>
            <dd>{{ cita.motivoCancelacion }}</dd>
          </template>
        </dl>
      </div>

      <div class="card">
        <div class="card-header">
          <h2>Observaciones administrativas</h2>
          <button v-if="puedeGestionar" type="button" class="btn btn-secondary btn-sm" @click="abrirObservaciones">Editar</button>
        </div>
        <p class="observaciones">{{ cita.observaciones || 'Sin observaciones' }}</p>

        <h2>Historial</h2>
        <ol class="historial">
          <li v-for="(evento, indice) in [...cita.historial].reverse()" :key="indice">
            <strong>{{ ACCIONES[evento.accion] || evento.accion }}</strong>
            <StatusBadge v-if="evento.estado" :estado="evento.estado" :etiquetas="ESTADOS_CITA" />
            <div class="text-muted">
              {{ formatearFechaHora(evento.fecha) }} · {{ evento.usuario?.nombres }} {{ evento.usuario?.apellidos }}
            </div>
            <div v-if="evento.detalle">{{ evento.detalle }}</div>
          </li>
        </ol>
      </div>
    </div>

    <CitaPagos v-if="puedeGestionar" :key="cita._id" :cita="cita" class="pagos" @changed="cargar" />

    <CitaForm v-model="mostrarReprogramar" :cita="cita" @saved="cargar" />

    <ConfirmDialog
      v-model="mostrarCancelar"
      title="Cancelar cita"
      message="La cita se marcará como cancelada y liberará el horario."
      confirm-text="Cancelar cita"
      danger
      require-reason
      reason-label="Motivo de la cancelación"
      :loading="procesando"
      @confirm="(motivo) => cambiar('CANCELADA', motivo)"
    />

    <BaseModal v-model="mostrarObservaciones" title="Observaciones administrativas">
      <FormField id="cita-observaciones" label="Observaciones">
        <textarea id="cita-observaciones" v-model.trim="observaciones" rows="5" maxlength="2000"></textarea>
      </FormField>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="mostrarObservaciones = false">Cancelar</button>
        <button type="button" class="btn btn-primary" :disabled="procesando" @click="guardarObservaciones">Guardar</button>
      </template>
    </BaseModal>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CitaForm from '@/components/admin/CitaForm.vue';
import CitaPagos from '@/components/admin/CitaPagos.vue';
import BaseModal from '@/components/common/BaseModal.vue';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
import FormField from '@/components/common/FormField.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import citasService from '@/services/citas.service';
import { useAuthStore } from '@/stores/auth';
import { useNotificationsStore } from '@/stores/notifications';
import { ESTADOS_CITA, ESTADOS_FINANCIEROS } from '@/utils/catalogos';
import { mensajeError } from '@/utils/errors';
import { formatearFechaHora, formatearFechaLarga, formatearMoneda } from '@/utils/format';
import { ROLES } from '@/utils/roles';

const ACCIONES = {
  PROGRAMADA: 'Cita programada',
  REPROGRAMADA: 'Cita reprogramada',
  CAMBIO_ESTADO: 'Cambio de estado'
};

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const notifications = useNotificationsStore();

const cita = ref(null);
const procesando = ref(false);
const mostrarReprogramar = ref(false);
const mostrarCancelar = ref(false);
const mostrarObservaciones = ref(false);
const observaciones = ref('');

const puedeGestionar = computed(() => auth.tieneRol(ROLES.ADMINISTRADOR, ROLES.RECEPCIONISTA));
const activa = computed(() => ['PENDIENTE', 'CONFIRMADA'].includes(cita.value?.estado));

async function cargar() {
  try {
    cita.value = await citasService.obtener(route.params.id);
  } catch (error) {
    notifications.error(mensajeError(error));
    router.replace({ name: 'admin-citas' });
  }
}

async function cambiar(estado, motivo) {
  procesando.value = true;
  try {
    cita.value = await citasService.cambiarEstado(cita.value._id, estado, motivo);
    notifications.exito(`Cita ${ESTADOS_CITA[estado].toLowerCase()} correctamente`);
    mostrarCancelar.value = false;
  } catch (error) {
    notifications.error(mensajeError(error));
  } finally {
    procesando.value = false;
  }
}

function abrirObservaciones() {
  observaciones.value = cita.value.observaciones;
  mostrarObservaciones.value = true;
}

async function guardarObservaciones() {
  procesando.value = true;
  try {
    cita.value = await citasService.actualizar(cita.value._id, { observaciones: observaciones.value });
    notifications.exito('Observaciones actualizadas');
    mostrarObservaciones.value = false;
  } catch (error) {
    notifications.error(mensajeError(error));
  } finally {
    procesando.value = false;
  }
}

watch(() => route.params.id, (id) => id && cargar());
onMounted(cargar);
</script>

<style scoped>
.pagos {
  margin-top: 1rem;
}

.subtitulo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.25rem 0 0;
  flex-wrap: wrap;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
}

.observaciones {
  white-space: pre-line;
  margin-bottom: 1.5rem;
}

.historial {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.historial li {
  border-left: 3px solid var(--color-primary-soft);
  padding-left: 0.75rem;
}

.historial li strong {
  margin-right: 0.5rem;
}
</style>
