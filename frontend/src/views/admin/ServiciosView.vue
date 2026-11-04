<template>
  <section>
    <div class="page-header">
      <h1>Servicios</h1>
      <button v-if="esAdmin" type="button" class="btn btn-primary" @click="abrirFormulario()">Nuevo servicio</button>
    </div>

    <div class="card">
      <form class="toolbar" @submit.prevent="cargar">
        <FormField id="filtro-q" label="Buscar">
          <input id="filtro-q" v-model.trim="filtros.q" type="search" placeholder="Nombre del servicio" />
        </FormField>
        <FormField id="filtro-estado" label="Estado">
          <select id="filtro-estado" v-model="filtros.estado">
            <option value="">Todos</option>
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
          </select>
        </FormField>
        <button type="submit" class="btn btn-secondary">Filtrar</button>
      </form>

      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Duración</th>
              <th class="text-right">Precio</th>
              <th>Estado</th>
              <th v-if="esAdmin">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="servicio in servicios" :key="servicio._id">
              <td>
                <img v-if="servicio.imagen" :src="servicio.imagen" :alt="servicio.nombre" class="thumb" />
              </td>
              <td>
                <strong>{{ servicio.nombre }}</strong>
                <div class="text-muted descripcion">{{ servicio.descripcion }}</div>
              </td>
              <td>{{ servicio.duracionMinutos }} min</td>
              <td class="text-right">{{ formatearMoneda(servicio.precio) }}</td>
              <td><StatusBadge :estado="servicio.estado" /></td>
              <td v-if="esAdmin">
                <div class="actions">
                  <button type="button" class="btn btn-secondary btn-sm" @click="abrirFormulario(servicio)">Editar</button>
                  <button
                    type="button"
                    class="btn btn-sm"
                    :class="servicio.estado === 'ACTIVO' ? 'btn-danger' : 'btn-success'"
                    @click="alternarEstado(servicio)"
                  >
                    {{ servicio.estado === 'ACTIVO' ? 'Desactivar' : 'Activar' }}
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!cargando && servicios.length === 0">
              <td :colspan="esAdmin ? 6 : 5" class="text-muted">No hay servicios registrados</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <BaseModal v-model="mostrarFormulario" :title="editando ? 'Editar servicio' : 'Nuevo servicio'">
      <form id="form-servicio" class="form-grid" novalidate @submit.prevent="guardar">
        <FormField id="nombre" label="Nombre" :error="errores.nombre" class="span-all" required>
          <input id="nombre" v-model.trim="form.nombre" maxlength="120" />
        </FormField>
        <FormField id="descripcion" label="Descripción" :error="errores.descripcion" class="span-all" required>
          <textarea id="descripcion" v-model.trim="form.descripcion" maxlength="2000"></textarea>
        </FormField>
        <FormField id="duracion" label="Duración (minutos)" :error="errores.duracionMinutos" required>
          <input id="duracion" v-model.number="form.duracionMinutos" type="number" min="5" max="480" step="5" />
        </FormField>
        <FormField id="precio" label="Precio (Q)" :error="errores.precio" required>
          <input id="precio" v-model="form.precio" type="number" min="0" step="0.01" />
        </FormField>
        <FormField id="imagen" label="URL de imagen" :error="errores.imagen" class="span-all">
          <input id="imagen" v-model.trim="form.imagen" type="url" placeholder="https://" />
        </FormField>
        <p v-if="editando" class="alert alert-info span-all">Las citas ya programadas conservan el precio con el que fueron registradas.</p>
      </form>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="mostrarFormulario = false">Cancelar</button>
        <button type="submit" form="form-servicio" class="btn btn-primary" :disabled="guardando">Guardar</button>
      </template>
    </BaseModal>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import BaseModal from '@/components/common/BaseModal.vue';
import FormField from '@/components/common/FormField.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import serviciosService from '@/services/servicios.service';
import { useAuthStore } from '@/stores/auth';
import { useNotificationsStore } from '@/stores/notifications';
import { erroresPorCampo, mensajeError } from '@/utils/errors';
import { aMonto, formatearMoneda } from '@/utils/format';
import { ROLES } from '@/utils/roles';
import { minimo, montoNoNegativo, requerido, validarFormulario } from '@/utils/validators';

const auth = useAuthStore();
const notifications = useNotificationsStore();
const esAdmin = computed(() => auth.tieneRol(ROLES.ADMINISTRADOR));

const servicios = ref([]);
const cargando = ref(false);
const filtros = reactive({ q: '', estado: '' });

const vacio = () => ({ nombre: '', descripcion: '', duracionMinutos: 60, precio: '', imagen: '' });
const form = reactive(vacio());
const errores = ref({});
const editando = ref(null);
const guardando = ref(false);
const mostrarFormulario = ref(false);

const duracionValida = (valor) => (Number.isInteger(valor) && valor >= 5 && valor <= 480) || 'Ingrese una duración entre 5 y 480 minutos';

async function cargar() {
  cargando.value = true;
  try {
    const params = Object.fromEntries(Object.entries(filtros).filter(([, v]) => v));
    servicios.value = await serviciosService.listar(params);
  } catch (error) {
    notifications.error(mensajeError(error));
  } finally {
    cargando.value = false;
  }
}

function abrirFormulario(servicio = null) {
  editando.value = servicio;
  Object.assign(
    form,
    vacio(),
    servicio
      ? {
          nombre: servicio.nombre,
          descripcion: servicio.descripcion,
          duracionMinutos: servicio.duracionMinutos,
          precio: servicio.precio.toFixed(2),
          imagen: servicio.imagen
        }
      : {}
  );
  errores.value = {};
  mostrarFormulario.value = true;
}

async function guardar() {
  errores.value = validarFormulario(form, {
    nombre: [requerido, minimo(3)],
    descripcion: [requerido, minimo(10)],
    duracionMinutos: [duracionValida],
    precio: [requerido, montoNoNegativo]
  });
  if (Object.keys(errores.value).length > 0) {
    return;
  }

  guardando.value = true;
  const datos = { ...form, precio: aMonto(form.precio) };
  try {
    if (editando.value) {
      await serviciosService.actualizar(editando.value._id, datos);
      notifications.exito('Servicio actualizado correctamente');
    } else {
      await serviciosService.crear(datos);
      notifications.exito('Servicio registrado correctamente');
    }
    mostrarFormulario.value = false;
    cargar();
  } catch (error) {
    errores.value = erroresPorCampo(error);
    notifications.error(mensajeError(error));
  } finally {
    guardando.value = false;
  }
}

async function alternarEstado(servicio) {
  const estado = servicio.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
  try {
    await serviciosService.cambiarEstado(servicio._id, estado);
    notifications.exito('Estado del servicio actualizado');
    cargar();
  } catch (error) {
    notifications.error(mensajeError(error));
  }
}

onMounted(cargar);
</script>

<style scoped>
.thumb {
  width: 56px;
  height: 42px;
  object-fit: cover;
  border-radius: var(--radius-sm);
}

.descripcion {
  font-size: 0.85rem;
  max-width: 420px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
