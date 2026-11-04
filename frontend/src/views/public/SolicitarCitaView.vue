<template>
  <section class="container page">
    <h1>Solicitar cita</h1>
    <p class="text-muted">
      Complete el formulario y nuestro equipo se comunicará con usted para confirmar la fecha y hora disponibles. La solicitud no reserva un horario automáticamente.
    </p>

    <div class="solicitud-grid">
      <form class="card form-stack" novalidate @submit.prevent="enviar">
        <FormField id="s-nombre" label="Nombre del solicitante" :error="errores.nombreSolicitante" required>
          <input id="s-nombre" v-model.trim="form.nombreSolicitante" maxlength="120" autocomplete="name" />
        </FormField>
        <div class="form-grid">
          <FormField id="s-correo" label="Correo electrónico" :error="errores.correo" required>
            <input id="s-correo" v-model.trim="form.correo" type="email" maxlength="120" autocomplete="email" />
          </FormField>
          <FormField id="s-telefono" label="Teléfono" :error="errores.telefono" required>
            <input id="s-telefono" v-model.trim="form.telefono" type="tel" maxlength="20" autocomplete="tel" />
          </FormField>
          <FormField id="s-servicio" label="Servicio solicitado" :error="errores.servicio" required>
            <select id="s-servicio" v-model="form.servicio">
              <option value="">Seleccione un servicio</option>
              <option v-for="servicio in servicios" :key="servicio._id" :value="servicio._id">{{ servicio.nombre }}</option>
            </select>
          </FormField>
          <FormField id="s-fecha" label="Fecha preferida" :error="errores.fechaPreferida" required>
            <input id="s-fecha" v-model="form.fechaPreferida" type="date" :min="hoy" />
          </FormField>
        </div>
        <FormField id="s-mensaje" label="Mensaje adicional" :error="errores.mensaje">
          <textarea id="s-mensaje" v-model.trim="form.mensaje" rows="4" maxlength="1000"></textarea>
        </FormField>
        <button type="submit" class="btn btn-primary" :disabled="enviando">{{ enviando ? 'Enviando...' : 'Enviar solicitud' }}</button>
      </form>

      <aside class="card">
        <h2>Horarios de atención</h2>
        <div v-for="horario in sitio.horarios" :key="horario._id" class="horario">
          <span>{{ horario.nombreDia }}</span>
          <span :class="{ 'text-muted': !horario.activo }">{{ horario.activo ? `${horario.horaInicio} – ${horario.horaFin}` : 'Cerrado' }}</span>
        </div>
        <template v-if="servicioSeleccionado">
          <h2 class="servicio-titulo">{{ servicioSeleccionado.nombre }}</h2>
          <p class="text-muted">{{ servicioSeleccionado.descripcion }}</p>
          <p><strong>Duración estimada:</strong> {{ servicioSeleccionado.duracionMinutos }} minutos</p>
        </template>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import FormField from '@/components/common/FormField.vue';
import portalService from '@/services/portal.service';
import solicitudesService from '@/services/solicitudes.service';
import { useNotificationsStore } from '@/stores/notifications';
import { useSitioStore } from '@/stores/sitio';
import { erroresPorCampo, mensajeError } from '@/utils/errors';
import { fechaISO } from '@/utils/format';
import { correo, minimo, requerido, telefono, validarFormulario } from '@/utils/validators';

const route = useRoute();
const sitio = useSitioStore();
const notifications = useNotificationsStore();
const hoy = fechaISO();

const servicios = ref([]);
const vacio = () => ({ nombreSolicitante: '', correo: '', telefono: '', servicio: '', fechaPreferida: '', mensaje: '' });
const form = reactive(vacio());
const errores = ref({});
const enviando = ref(false);

const servicioSeleccionado = computed(() => servicios.value.find((servicio) => servicio._id === form.servicio));
const noPasada = (valor) => !valor || valor >= hoy || 'La fecha no puede ser pasada';

async function enviar() {
  errores.value = validarFormulario(form, {
    nombreSolicitante: [requerido, minimo(3)],
    correo: [requerido, correo],
    telefono: [requerido, telefono],
    servicio: [requerido],
    fechaPreferida: [requerido, noPasada]
  });
  if (Object.keys(errores.value).length > 0) {
    return;
  }

  enviando.value = true;
  try {
    const respuesta = await solicitudesService.crear({ ...form });
    notifications.exito(respuesta.message);
    Object.assign(form, vacio());
  } catch (error) {
    errores.value = erroresPorCampo(error);
    notifications.error(mensajeError(error));
  } finally {
    enviando.value = false;
  }
}

onMounted(async () => {
  try {
    servicios.value = await portalService.servicios();
    if (servicios.value.some((servicio) => servicio._id === route.query.servicio)) {
      form.servicio = route.query.servicio;
    }
  } catch (error) {
    notifications.error(mensajeError(error));
  }
});
</script>

<style scoped>
.page {
  padding-block: 2rem;
}

.solicitud-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  align-items: start;
}

.horario {
  display: flex;
  justify-content: space-between;
  padding: 0.35rem 0;
  border-bottom: 1px solid var(--color-border);
}

.servicio-titulo {
  margin-top: 1.5rem;
}

@media (max-width: 800px) {
  .solicitud-grid {
    grid-template-columns: 1fr;
  }
}
</style>
