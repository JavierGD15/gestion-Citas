<template>
  <section>
    <div class="page-header">
      <h1>Calendario de citas</h1>
      <div class="leyenda">
        <span v-for="(etiqueta, estado) in ESTADOS_CITA" :key="estado" class="leyenda-item">
          <span class="punto" :style="{ background: COLORES[estado] }"></span>{{ etiqueta }}
        </span>
      </div>
    </div>

    <div class="calendario-layout">
      <div class="card calendario-card">
        <div class="toolbar">
          <FormField v-if="!esProfesional" id="cal-profesional" label="Profesional">
            <select id="cal-profesional" v-model="filtros.profesional">
              <option value="">Todos</option>
              <option v-for="profesional in profesionales" :key="profesional._id" :value="profesional._id">{{ profesional.nombreCompleto }}</option>
            </select>
          </FormField>
          <FormField id="cal-estado" label="Estado">
            <select id="cal-estado" v-model="filtros.estado">
              <option value="">Todos</option>
              <option v-for="(etiqueta, valor) in ESTADOS_CITA" :key="valor" :value="valor">{{ etiqueta }}</option>
            </select>
          </FormField>
        </div>
        <FullCalendar ref="calendario" :options="opciones" />
      </div>

      <aside class="card panel">
        <template v-if="seleccionada">
          <div class="panel-header">
            <h2>Cita {{ seleccionada.codigo }}</h2>
            <button type="button" class="btn-link" @click="seleccionada = null">Ver día</button>
          </div>
          <StatusBadge :estado="seleccionada.estado" :etiquetas="ESTADOS_CITA" />
          <dl class="detail-list detalle">
            <dt>Paciente</dt>
            <dd>{{ seleccionada.paciente?.nombres }} {{ seleccionada.paciente?.apellidos }}</dd>
            <dt>Servicio</dt>
            <dd>{{ seleccionada.servicio?.nombre }}</dd>
            <dt>Profesional</dt>
            <dd>{{ seleccionada.profesional?.nombreCompleto }}</dd>
            <dt>Fecha</dt>
            <dd>{{ formatearFechaLarga(seleccionada.fecha) }}</dd>
            <dt>Horario</dt>
            <dd>{{ seleccionada.horaInicio }} – {{ seleccionada.horaFin }}</dd>
            <dt>Precio</dt>
            <dd>{{ formatearMoneda(seleccionada.precio) }}</dd>
          </dl>
          <RouterLink :to="{ name: 'admin-cita-detalle', params: { id: seleccionada._id } }" class="btn btn-primary btn-block">Ver detalle completo</RouterLink>
        </template>
        <template v-else>
          <h2>{{ fechaSeleccionada ? formatearFechaLarga(fechaSeleccionada) : 'Seleccione un día' }}</h2>
          <p v-if="fechaSeleccionada && citasDelDia.length === 0" class="text-muted">No hay citas en esta fecha.</p>
          <ul class="lista-dia">
            <li v-for="cita in citasDelDia" :key="cita._id" :style="{ borderLeftColor: COLORES[cita.estado] }" @click="seleccionada = cita">
              <strong>{{ cita.horaInicio }} – {{ cita.horaFin }}</strong>
              <span>{{ cita.paciente?.nombres }} {{ cita.paciente?.apellidos }}</span>
              <small class="text-muted">{{ cita.servicio?.nombre }} · {{ cita.profesional?.nombreCompleto }}</small>
              <StatusBadge :estado="cita.estado" :etiquetas="ESTADOS_CITA" />
            </li>
          </ul>
        </template>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import FormField from '@/components/common/FormField.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import citasService from '@/services/citas.service';
import profesionalesService from '@/services/profesionales.service';
import { useAuthStore } from '@/stores/auth';
import { useNotificationsStore } from '@/stores/notifications';
import { ESTADOS_CITA } from '@/utils/catalogos';
import { mensajeError } from '@/utils/errors';
import { fechaISO, formatearFechaLarga, formatearMoneda } from '@/utils/format';
import { ROLES } from '@/utils/roles';

const COLORES = {
  PENDIENTE: '#c98a12',
  CONFIRMADA: '#2a6f97',
  COMPLETADA: '#2e9d63',
  CANCELADA: '#9aa5b1'
};

const auth = useAuthStore();
const notifications = useNotificationsStore();
const esProfesional = computed(() => auth.tieneRol(ROLES.PROFESIONAL));

const calendario = ref(null);
const citas = ref([]);
const profesionales = ref([]);
const filtros = reactive({ profesional: '', estado: '' });
const rango = ref(null);
const fechaSeleccionada = ref(fechaISO());
const seleccionada = ref(null);

const citasDelDia = computed(() => citas.value.filter((cita) => cita.fecha === fechaSeleccionada.value));
const diasConCitas = computed(() => new Set(citas.value.map((cita) => cita.fecha)));

function mesesEnRango(inicio, fin) {
  const meses = [];
  const cursor = new Date(Date.UTC(inicio.getFullYear(), inicio.getMonth(), 1));
  while (cursor < fin) {
    meses.push(`${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, '0')}`);
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return meses;
}

async function cargar() {
  if (!rango.value) {
    return;
  }
  const params = Object.fromEntries(Object.entries(filtros).filter(([, valor]) => valor));
  try {
    const resultados = await Promise.all(mesesEnRango(rango.value.start, rango.value.end).map((mes) => citasService.calendario({ ...params, mes })));
    citas.value = resultados.flat();
  } catch (error) {
    notifications.error(mensajeError(error));
  }
}

const eventos = computed(() =>
  citas.value.map((cita) => ({
    id: cita._id,
    title: `${cita.paciente?.nombres ?? ''} ${cita.paciente?.apellidos ?? ''} · ${cita.servicio?.nombre ?? ''}`,
    start: `${cita.fecha}T${cita.horaInicio}:00`,
    end: `${cita.fecha}T${cita.horaFin}:00`,
    backgroundColor: COLORES[cita.estado],
    borderColor: COLORES[cita.estado],
    classNames: cita.estado === 'CANCELADA' ? ['evento-cancelado'] : [],
    extendedProps: { cita }
  }))
);

const opciones = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  locale: esLocale,
  timeZone: 'local',
  height: 'auto',
  headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,listWeek' },
  dayMaxEvents: 3,
  eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
  slotMinTime: '07:00:00',
  slotMaxTime: '20:00:00',
  events: eventos.value,
  dayCellClassNames: ({ date }) => {
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const clases = [];
    if (diasConCitas.value.has(iso)) {
      clases.push('dia-con-citas');
    }
    if (iso === fechaSeleccionada.value) {
      clases.push('dia-seleccionado');
    }
    return clases;
  },
  datesSet: ({ start, end }) => {
    rango.value = { start, end };
    cargar();
  },
  dateClick: ({ dateStr }) => {
    fechaSeleccionada.value = dateStr.slice(0, 10);
    seleccionada.value = null;
  },
  eventClick: ({ event }) => {
    seleccionada.value = event.extendedProps.cita;
    fechaSeleccionada.value = event.extendedProps.cita.fecha;
  }
}));

watch(filtros, cargar);

onMounted(async () => {
  if (!esProfesional.value) {
    try {
      profesionales.value = await profesionalesService.listar();
    } catch {
      profesionales.value = [];
    }
  }
});
</script>

<style scoped>
.leyenda {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: 0.85rem;
}

.leyenda-item {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.punto {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.calendario-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 1rem;
  align-items: start;
}

.calendario-card {
  min-width: 0;
}

.panel {
  position: sticky;
  top: 1rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.detalle {
  margin: 1rem 0;
}

.lista-dia {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.lista-dia li {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--color-border);
  border-left: 4px solid;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.lista-dia li:hover {
  background: var(--color-surface-alt);
}

.calendario-card :deep(.fc) {
  font-size: 0.875rem;
}

.calendario-card :deep(.fc .fc-toolbar-title) {
  font-size: 1.15rem;
  text-transform: capitalize;
}

.calendario-card :deep(.fc .fc-button-primary) {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.calendario-card :deep(.dia-con-citas .fc-daygrid-day-number) {
  font-weight: 800;
  color: var(--color-primary-dark);
}

.calendario-card :deep(.dia-seleccionado) {
  background: var(--color-primary-soft);
}

.calendario-card :deep(.evento-cancelado .fc-event-title) {
  text-decoration: line-through;
}

.calendario-card :deep(.fc-event) {
  cursor: pointer;
}

@media (max-width: 1100px) {
  .calendario-layout {
    grid-template-columns: 1fr;
  }

  .panel {
    position: static;
  }
}

@media (max-width: 600px) {
  .calendario-card :deep(.fc .fc-toolbar) {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
