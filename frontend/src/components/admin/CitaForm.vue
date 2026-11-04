<template>
  <BaseModal :model-value="modelValue" :title="titulo" size="lg" @update:model-value="$emit('update:modelValue', $event)">
    <div v-if="solicitud" class="alert alert-info solicitud-info">
      Solicitud de <strong>{{ solicitud.nombreSolicitante }}</strong> · {{ solicitud.telefono }} · Fecha preferida {{ formatearFecha(solicitud.fechaPreferida) }}
      <span v-if="solicitud.mensaje"><br />“{{ solicitud.mensaje }}”</span>
    </div>

    <form id="form-cita" class="form-grid" novalidate @submit.prevent="guardar">
      <FormField id="c-paciente" label="Paciente" :error="errores.paciente" class="span-all" required>
        <BuscadorSelector
          id="c-paciente"
          v-model="paciente"
          :fetcher="(q) => buscarPacientes(q, true)"
          :detalle="(p) => `${p.codigo} · ${p.edad} años${p.esMenor ? ' · menor de edad' : ''}`"
          :disabled="esReprogramacion || Boolean(pacienteInicial)"
          placeholder="Buscar paciente activo por nombre o código"
        />
        <small v-if="solicitud" class="text-muted">
          Si el solicitante aún no está registrado como paciente,
          <RouterLink :to="{ name: 'admin-pacientes' }" target="_blank">regístrelo primero</RouterLink>.
        </small>
      </FormField>

      <FormField id="c-servicio" label="Servicio" :error="errores.servicio" required>
        <select id="c-servicio" v-model="form.servicio" :disabled="esReprogramacion">
          <option value="">Seleccione</option>
          <option v-for="servicio in serviciosDisponibles" :key="servicio._id" :value="servicio._id">
            {{ servicio.nombre }} ({{ servicio.duracionMinutos }} min)
          </option>
        </select>
      </FormField>

      <FormField id="c-profesional" label="Profesional" :error="errores.profesional" required>
        <select id="c-profesional" v-model="form.profesional">
          <option value="">Seleccione</option>
          <option v-for="profesional in profesionales" :key="profesional._id" :value="profesional._id">
            {{ profesional.nombreCompleto }} · {{ profesional.especialidad }}
          </option>
        </select>
      </FormField>

      <FormField id="c-fecha" label="Fecha" :error="errores.fecha" required>
        <input id="c-fecha" v-model="form.fecha" type="date" :min="hoy" />
      </FormField>

      <FormField id="c-hora" label="Hora de inicio" :error="errores.horaInicio" required>
        <input id="c-hora" v-model="form.horaInicio" type="time" step="900" />
      </FormField>

      <div v-if="disponibilidad" class="span-all disponibilidad">
        <template v-if="disponibilidad.horario">
          <small class="text-muted">
            Horario de atención {{ disponibilidad.horario.horaInicio }} – {{ disponibilidad.horario.horaFin }}. Horarios disponibles:
          </small>
          <div class="slots">
            <button
              v-for="hora in disponibilidad.disponibles"
              :key="hora"
              type="button"
              class="slot"
              :class="{ activo: form.horaInicio === hora }"
              @click="form.horaInicio = hora"
            >
              {{ hora }}
            </button>
            <span v-if="disponibilidad.disponibles.length === 0" class="text-muted">No hay horarios disponibles en esta fecha.</span>
          </div>
          <small v-if="disponibilidad.ocupadas.length" class="text-muted">
            Ocupado: {{ disponibilidad.ocupadas.map((c) => `${c.horaInicio}-${c.horaFin}`).join(', ') }}
          </small>
        </template>
        <p v-else class="alert alert-warning">No hay atención en el día seleccionado.</p>
      </div>

      <div v-if="servicioSeleccionado" class="span-all resumen">
        <div><span class="text-muted">Duración</span><strong>{{ servicioSeleccionado.duracionMinutos }} min</strong></div>
        <div><span class="text-muted">Finaliza</span><strong>{{ horaFin || '—' }}</strong></div>
        <div>
          <span class="text-muted">Precio</span>
          <strong>{{ formatearMoneda(esReprogramacion ? cita.precio : servicioSeleccionado.precio) }}</strong>
        </div>
      </div>

      <FormField id="c-observaciones" label="Observaciones administrativas" :error="errores.observaciones" class="span-all">
        <textarea id="c-observaciones" v-model.trim="form.observaciones" maxlength="2000"></textarea>
      </FormField>
    </form>
    <template #footer>
      <button type="button" class="btn btn-secondary" @click="$emit('update:modelValue', false)">Cancelar</button>
      <button type="submit" form="form-cita" class="btn btn-primary" :disabled="guardando">
        {{ esReprogramacion ? 'Reprogramar' : 'Programar cita' }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import BaseModal from '@/components/common/BaseModal.vue';
import BuscadorSelector from '@/components/common/BuscadorSelector.vue';
import FormField from '@/components/common/FormField.vue';
import citasService from '@/services/citas.service';
import { buscarPacientes } from '@/services/pacientes.service';
import profesionalesService from '@/services/profesionales.service';
import serviciosService from '@/services/servicios.service';
import { convertirSolicitud } from '@/services/solicitudes.service';
import { useNotificationsStore } from '@/stores/notifications';
import { erroresPorCampo, mensajeError } from '@/utils/errors';
import { fechaISO, formatearFecha, formatearMoneda } from '@/utils/format';
import { requerido, validarFormulario } from '@/utils/validators';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  cita: { type: Object, default: null },
  solicitud: { type: Object, default: null },
  pacienteInicial: { type: Object, default: null }
});

const emit = defineEmits(['update:modelValue', 'saved']);
const notifications = useNotificationsStore();
const hoy = fechaISO();

const servicios = ref([]);
const profesionales = ref([]);
const paciente = ref(null);
const disponibilidad = ref(null);
const form = reactive({ servicio: '', profesional: '', fecha: '', horaInicio: '', observaciones: '' });
const errores = ref({});
const guardando = ref(false);

const esReprogramacion = computed(() => Boolean(props.cita));
const titulo = computed(() => {
  if (props.cita) {
    return `Reprogramar cita ${props.cita.codigo}`;
  }
  return props.solicitud ? 'Convertir solicitud en cita' : 'Programar cita';
});

const serviciosDisponibles = computed(() =>
  servicios.value.filter((servicio) => servicio.estado === 'ACTIVO' || servicio._id === form.servicio)
);
const servicioSeleccionado = computed(() => servicios.value.find((servicio) => servicio._id === form.servicio));
const duracion = computed(() => (esReprogramacion.value ? props.cita.duracionMinutos : servicioSeleccionado.value?.duracionMinutos));

const horaFin = computed(() => {
  if (!form.horaInicio || !duracion.value) {
    return '';
  }
  const [h, m] = form.horaInicio.split(':').map(Number);
  const total = h * 60 + m + duracion.value;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
});

async function cargarCatalogos() {
  try {
    const [listaServicios, listaProfesionales] = await Promise.all([
      serviciosService.listar(),
      profesionalesService.listar({ estado: 'ACTIVO' })
    ]);
    servicios.value = listaServicios;
    profesionales.value = listaProfesionales.filter((profesional) => profesional.usuario?.estado === 'ACTIVO');
  } catch (error) {
    notifications.error(mensajeError(error));
  }
}

async function cargarDisponibilidad() {
  disponibilidad.value = null;
  if (!form.profesional || !form.servicio || !form.fecha) {
    return;
  }
  try {
    disponibilidad.value = await citasService.disponibilidad({
      profesional: form.profesional,
      servicio: form.servicio,
      fecha: form.fecha,
      ...(props.cita ? { excluir: props.cita._id } : {})
    });
  } catch {
    disponibilidad.value = null;
  }
}

watch(() => [form.profesional, form.servicio, form.fecha], cargarDisponibilidad);

watch(
  () => props.modelValue,
  async (abierto) => {
    if (!abierto) {
      return;
    }
    errores.value = {};
    await cargarCatalogos();
    const { cita, solicitud, pacienteInicial } = props;
    if (cita) {
      paciente.value = cita.paciente;
      Object.assign(form, {
        servicio: cita.servicio?._id,
        profesional: cita.profesional?._id,
        fecha: cita.fecha < hoy ? hoy : cita.fecha,
        horaInicio: cita.horaInicio,
        observaciones: cita.observaciones
      });
    } else {
      paciente.value = pacienteInicial || null;
      const preferida = solicitud?.fechaPreferida?.slice(0, 10);
      Object.assign(form, {
        servicio: solicitud?.servicio?._id || '',
        profesional: '',
        fecha: preferida && preferida >= hoy ? preferida : '',
        horaInicio: '',
        observaciones: solicitud?.mensaje ? `Solicitud: ${solicitud.mensaje}` : ''
      });
    }
  }
);

async function guardar() {
  const valores = { ...form, paciente: paciente.value?._id };
  errores.value = validarFormulario(valores, {
    paciente: [requerido],
    servicio: [requerido],
    profesional: [requerido],
    fecha: [requerido, (valor) => valor >= hoy || 'La fecha no puede ser pasada'],
    horaInicio: [requerido]
  });
  if (Object.keys(errores.value).length > 0) {
    return;
  }

  guardando.value = true;
  try {
    let resultado;
    if (props.cita) {
      resultado = await citasService.actualizar(props.cita._id, {
        profesional: form.profesional,
        fecha: form.fecha,
        horaInicio: form.horaInicio,
        observaciones: form.observaciones
      });
      notifications.exito('Cita reprogramada correctamente');
    } else if (props.solicitud) {
      resultado = (await convertirSolicitud(props.solicitud._id, valores)).cita;
      notifications.exito('Solicitud atendida y cita programada correctamente');
    } else {
      resultado = await citasService.crear(valores);
      notifications.exito('Cita programada correctamente');
    }
    emit('saved', resultado);
    emit('update:modelValue', false);
  } catch (error) {
    errores.value = erroresPorCampo(error);
    notifications.error(mensajeError(error));
    cargarDisponibilidad();
  } finally {
    guardando.value = false;
  }
}
</script>

<style scoped>
.solicitud-info {
  margin-bottom: 1rem;
}

.disponibilidad {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.slots {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.slot {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: var(--radius-sm);
  padding: 0.25rem 0.55rem;
  font: inherit;
  font-size: 0.85rem;
  cursor: pointer;
}

.slot.activo,
.slot:hover {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

.resumen {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: var(--radius-sm);
  background: var(--color-surface-alt);
}

.resumen div {
  display: flex;
  flex-direction: column;
}
</style>
