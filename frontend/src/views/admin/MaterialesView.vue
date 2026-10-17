<template>
  <section>
    <div class="page-header">
      <h1>Materiales</h1>
      <div class="actions">
        <button type="button" class="btn btn-secondary" @click="abrirAsignar()">Asignar material</button>
        <button v-if="esAdmin" type="button" class="btn btn-primary" @click="abrirFormulario()">Nuevo material</button>
      </div>
    </div>

    <div class="card">
      <form class="toolbar" @submit.prevent="buscar">
        <FormField id="filtro-q" label="Buscar">
          <input id="filtro-q" v-model.trim="filtros.q" type="search" placeholder="Título, descripción o código" />
        </FormField>
        <FormField id="filtro-tipo" label="Tipo">
          <select id="filtro-tipo" v-model="filtros.tipo">
            <option value="">Todos</option>
            <option v-for="(etiqueta, valor) in TIPOS_MATERIAL" :key="valor" :value="valor">{{ etiqueta }}</option>
          </select>
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
              <th>Código</th>
              <th>Material</th>
              <th>Tipo</th>
              <th>Registro</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="material in items" :key="material._id">
              <td>{{ material.codigo }}</td>
              <td>
                <a :href="material.enlace" target="_blank" rel="noopener noreferrer"><strong>{{ material.titulo }}</strong></a>
                <div class="text-muted descripcion">{{ material.descripcion }}</div>
              </td>
              <td>{{ TIPOS_MATERIAL[material.tipo] }}</td>
              <td>{{ formatearFecha(material.fechaRegistro) }}</td>
              <td><StatusBadge :estado="material.estado" /></td>
              <td>
                <div class="actions">
                  <button v-if="material.estado === 'ACTIVO'" type="button" class="btn btn-primary btn-sm" @click="abrirAsignar(material)">Asignar</button>
                  <button type="button" class="btn btn-secondary btn-sm" @click="verAsignaciones(material)">Asignaciones</button>
                  <template v-if="esAdmin">
                    <button type="button" class="btn btn-secondary btn-sm" @click="abrirFormulario(material)">Editar</button>
                    <button
                      type="button"
                      class="btn btn-sm"
                      :class="material.estado === 'ACTIVO' ? 'btn-danger' : 'btn-success'"
                      @click="alternarEstado(material)"
                    >
                      {{ material.estado === 'ACTIVO' ? 'Desactivar' : 'Activar' }}
                    </button>
                  </template>
                </div>
              </td>
            </tr>
            <tr v-if="!cargando && items.length === 0">
              <td colspan="6" class="text-muted">No hay materiales registrados</td>
            </tr>
          </tbody>
        </table>
      </div>
      <PaginationBar :meta="meta" @change="cargar" />
    </div>

    <BaseModal v-model="mostrarFormulario" :title="editando ? 'Editar material' : 'Nuevo material'">
      <form id="form-material" class="form-stack" novalidate @submit.prevent="guardar">
        <FormField id="m-titulo" label="Título" :error="errores.titulo" required>
          <input id="m-titulo" v-model.trim="form.titulo" maxlength="150" />
        </FormField>
        <FormField id="m-descripcion" label="Descripción" :error="errores.descripcion" required>
          <textarea id="m-descripcion" v-model.trim="form.descripcion" maxlength="2000"></textarea>
        </FormField>
        <FormField id="m-tipo" label="Tipo" :error="errores.tipo" required>
          <select id="m-tipo" v-model="form.tipo">
            <option value="">Seleccione</option>
            <option v-for="(etiqueta, valor) in TIPOS_MATERIAL" :key="valor" :value="valor">{{ etiqueta }}</option>
          </select>
        </FormField>
        <FormField id="m-enlace" label="Enlace al recurso" :error="errores.enlace" required>
          <input id="m-enlace" v-model.trim="form.enlace" type="url" placeholder="https://" />
        </FormField>
      </form>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="mostrarFormulario = false">Cancelar</button>
        <button type="submit" form="form-material" class="btn btn-primary" :disabled="guardando">Guardar</button>
      </template>
    </BaseModal>

    <AsignarMaterialModal v-model="mostrarAsignar" :material-inicial="seleccionado" @saved="refrescarAsignaciones" />

    <BaseModal v-model="mostrarAsignaciones" :title="`Asignaciones · ${seleccionado?.titulo || ''}`" size="lg">
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Asignado por</th>
              <th>Fecha</th>
              <th>Indicaciones</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="asignacion in asignaciones" :key="asignacion._id">
              <td>{{ asignacion.paciente?.nombres }} {{ asignacion.paciente?.apellidos }}</td>
              <td>{{ asignacion.asignadoPor?.nombres }} {{ asignacion.asignadoPor?.apellidos }}</td>
              <td>{{ formatearFecha(asignacion.fechaAsignacion) }}</td>
              <td>{{ asignacion.indicaciones || '—' }}</td>
              <td><StatusBadge :estado="asignacion.estado" :etiquetas="{ ACTIVO: 'Vigente', INACTIVO: 'Retirada' }" /></td>
            </tr>
            <tr v-if="asignaciones.length === 0">
              <td colspan="5" class="text-muted">El material no ha sido asignado</td>
            </tr>
          </tbody>
        </table>
      </div>
    </BaseModal>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import AsignarMaterialModal from '@/components/admin/AsignarMaterialModal.vue';
import BaseModal from '@/components/common/BaseModal.vue';
import FormField from '@/components/common/FormField.vue';
import PaginationBar from '@/components/common/PaginationBar.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { useListado } from '@/composables/useListado';
import materialesService from '@/services/materiales.service';
import { useAuthStore } from '@/stores/auth';
import { useNotificationsStore } from '@/stores/notifications';
import { TIPOS_MATERIAL } from '@/utils/catalogos';
import { erroresPorCampo, mensajeError } from '@/utils/errors';
import { formatearFecha } from '@/utils/format';
import { ROLES } from '@/utils/roles';
import { minimo, requerido, validarFormulario } from '@/utils/validators';

const auth = useAuthStore();
const notifications = useNotificationsStore();
const esAdmin = computed(() => auth.tieneRol(ROLES.ADMINISTRADOR));
const { items, meta, cargando, filtros, cargar, buscar } = useListado(materialesService.listar, { q: '', tipo: '', estado: '' });

const vacio = () => ({ titulo: '', descripcion: '', tipo: '', enlace: '' });
const form = reactive(vacio());
const errores = ref({});
const editando = ref(null);
const guardando = ref(false);
const mostrarFormulario = ref(false);
const mostrarAsignar = ref(false);
const mostrarAsignaciones = ref(false);
const seleccionado = ref(null);
const asignaciones = ref([]);

const url = (valor) => !valor || /^https?:\/\/.+/.test(valor) || 'Ingrese un enlace que inicie con http:// o https://';

function abrirFormulario(material = null) {
  editando.value = material;
  Object.assign(form, vacio(), material ? { titulo: material.titulo, descripcion: material.descripcion, tipo: material.tipo, enlace: material.enlace } : {});
  errores.value = {};
  mostrarFormulario.value = true;
}

async function guardar() {
  errores.value = validarFormulario(form, {
    titulo: [requerido, minimo(3)],
    descripcion: [requerido, minimo(5)],
    tipo: [requerido],
    enlace: [requerido, url]
  });
  if (Object.keys(errores.value).length > 0) {
    return;
  }
  guardando.value = true;
  try {
    if (editando.value) {
      await materialesService.actualizar(editando.value._id, { ...form });
      notifications.exito('Material actualizado correctamente');
    } else {
      await materialesService.crear({ ...form });
      notifications.exito('Material registrado correctamente');
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

async function alternarEstado(material) {
  try {
    await materialesService.cambiarEstado(material._id, material.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO');
    notifications.exito('Estado del material actualizado');
    cargar();
  } catch (error) {
    notifications.error(mensajeError(error));
  }
}

function abrirAsignar(material = null) {
  seleccionado.value = material;
  mostrarAsignar.value = true;
}

async function verAsignaciones(material) {
  seleccionado.value = material;
  try {
    asignaciones.value = await materialesService.asignaciones(material._id);
    mostrarAsignaciones.value = true;
  } catch (error) {
    notifications.error(mensajeError(error));
  }
}

function refrescarAsignaciones() {
  if (mostrarAsignaciones.value && seleccionado.value) {
    verAsignaciones(seleccionado.value);
  }
}

onMounted(() => cargar(1));
</script>

<style scoped>
.descripcion {
  font-size: 0.85rem;
  max-width: 460px;
}
</style>
