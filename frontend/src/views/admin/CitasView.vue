<template>
  <section>
    <div class="page-header">
      <h1>{{ esProfesional ? 'Mis citas' : 'Citas' }}</h1>
      <button v-if="puedeGestionar" type="button" class="btn btn-primary" @click="mostrarFormulario = true">Programar cita</button>
    </div>

    <div class="card">
      <form class="toolbar" @submit.prevent="buscar">
        <FormField id="filtro-desde" label="Desde">
          <input id="filtro-desde" v-model="filtros.desde" type="date" />
        </FormField>
        <FormField id="filtro-hasta" label="Hasta">
          <input id="filtro-hasta" v-model="filtros.hasta" type="date" />
        </FormField>
        <FormField v-if="!esProfesional" id="filtro-profesional" label="Profesional">
          <select id="filtro-profesional" v-model="filtros.profesional">
            <option value="">Todos</option>
            <option v-for="profesional in profesionales" :key="profesional._id" :value="profesional._id">{{ profesional.nombreCompleto }}</option>
          </select>
        </FormField>
        <FormField id="filtro-estado" label="Estado">
          <select id="filtro-estado" v-model="filtros.estado">
            <option value="">Todos</option>
            <option v-for="(etiqueta, valor) in ESTADOS_CITA" :key="valor" :value="valor">{{ etiqueta }}</option>
          </select>
        </FormField>
        <button type="submit" class="btn btn-secondary">Filtrar</button>
        <button type="button" class="btn btn-secondary" @click="verTodas">Ver todas</button>
      </form>

      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Fecha</th>
              <th>Horario</th>
              <th>Paciente</th>
              <th>Servicio</th>
              <th v-if="!esProfesional">Profesional</th>
              <th class="text-right">Precio</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cita in items" :key="cita._id" class="fila" @click="abrir(cita)">
              <td>
                <RouterLink :to="{ name: 'admin-cita-detalle', params: { id: cita._id } }">{{ cita.codigo }}</RouterLink>
              </td>
              <td>{{ formatearFecha(cita.fecha) }}</td>
              <td>{{ cita.horaInicio }} – {{ cita.horaFin }}</td>
              <td>{{ cita.paciente?.nombres }} {{ cita.paciente?.apellidos }}</td>
              <td>{{ cita.servicio?.nombre }}</td>
              <td v-if="!esProfesional">{{ cita.profesional?.nombreCompleto }}</td>
              <td class="text-right">{{ formatearMoneda(cita.precio) }}</td>
              <td><StatusBadge :estado="cita.estado" :etiquetas="ESTADOS_CITA" /></td>
            </tr>
            <tr v-if="!cargando && items.length === 0">
              <td :colspan="esProfesional ? 7 : 8" class="text-muted">No hay citas para los filtros seleccionados</td>
            </tr>
          </tbody>
        </table>
      </div>
      <PaginationBar :meta="meta" @change="cargar" />
    </div>

    <CitaForm v-model="mostrarFormulario" @saved="(cita) => router.push({ name: 'admin-cita-detalle', params: { id: cita._id } })" />
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import CitaForm from '@/components/admin/CitaForm.vue';
import FormField from '@/components/common/FormField.vue';
import PaginationBar from '@/components/common/PaginationBar.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { useListado } from '@/composables/useListado';
import citasService from '@/services/citas.service';
import profesionalesService from '@/services/profesionales.service';
import { useAuthStore } from '@/stores/auth';
import { ESTADOS_CITA } from '@/utils/catalogos';
import { fechaISO, formatearFecha, formatearMoneda } from '@/utils/format';
import { ROLES } from '@/utils/roles';

const router = useRouter();
const auth = useAuthStore();
const esProfesional = computed(() => auth.tieneRol(ROLES.PROFESIONAL));
const puedeGestionar = computed(() => auth.tieneRol(ROLES.ADMINISTRADOR, ROLES.RECEPCIONISTA));

const { items, meta, cargando, filtros, cargar, buscar } = useListado(citasService.listar, {
  desde: fechaISO(),
  hasta: '',
  profesional: '',
  estado: '',
  orden: 'asc'
});

const profesionales = ref([]);
const mostrarFormulario = ref(false);

function abrir(cita) {
  router.push({ name: 'admin-cita-detalle', params: { id: cita._id } });
}

function verTodas() {
  Object.assign(filtros, { desde: '', hasta: '', profesional: '', estado: '', orden: 'desc' });
  buscar();
}

onMounted(async () => {
  cargar(1);
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
.fila {
  cursor: pointer;
}
</style>
