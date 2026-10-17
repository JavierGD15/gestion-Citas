<template>
  <section>
    <div class="page-header">
      <h1>Profesionales</h1>
      <button v-if="esAdmin" type="button" class="btn btn-primary" @click="abrirFormulario()">Registrar profesional</button>
    </div>

    <div class="card">
      <form class="toolbar" @submit.prevent="cargar">
        <FormField id="filtro-q" label="Buscar">
          <input id="filtro-q" v-model.trim="filtros.q" type="search" placeholder="Nombre o especialidad" />
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
              <th>Profesional</th>
              <th>Especialidad</th>
              <th>Colegiado</th>
              <th>Contacto</th>
              <th>Estado</th>
              <th v-if="esAdmin">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="profesional in profesionales" :key="profesional._id">
              <td>
                <div class="persona">
                  <AvatarImg :src="profesional.fotografia" :nombre="profesional.nombreCompleto" />
                  <strong>{{ profesional.nombreCompleto }}</strong>
                </div>
              </td>
              <td>{{ profesional.especialidad }}</td>
              <td>{{ profesional.colegiado || '—' }}</td>
              <td>
                <div>{{ profesional.telefono }}</div>
                <div class="text-muted">{{ profesional.usuario?.correo }}</div>
              </td>
              <td>
                <StatusBadge :estado="profesional.estado" />
                <div v-if="profesional.usuario?.estado === 'INACTIVO'" class="text-muted small">Usuario inactivo</div>
              </td>
              <td v-if="esAdmin">
                <div class="actions">
                  <button type="button" class="btn btn-secondary btn-sm" @click="abrirFormulario(profesional)">Editar</button>
                  <button
                    type="button"
                    class="btn btn-sm"
                    :class="profesional.estado === 'ACTIVO' ? 'btn-danger' : 'btn-success'"
                    @click="alternarEstado(profesional)"
                  >
                    {{ profesional.estado === 'ACTIVO' ? 'Desactivar' : 'Activar' }}
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!cargando && profesionales.length === 0">
              <td :colspan="esAdmin ? 6 : 5" class="text-muted">No hay profesionales registrados</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <BaseModal v-model="mostrarFormulario" :title="editando ? 'Editar profesional' : 'Registrar profesional'" size="lg">
      <form id="form-profesional" class="form-grid" novalidate @submit.prevent="guardar">
        <FormField id="pr-nombres" label="Nombres" :error="errores.nombres" required>
          <input id="pr-nombres" v-model.trim="form.nombres" maxlength="80" />
        </FormField>
        <FormField id="pr-apellidos" label="Apellidos" :error="errores.apellidos" required>
          <input id="pr-apellidos" v-model.trim="form.apellidos" maxlength="80" />
        </FormField>
        <FormField id="pr-correo" label="Correo de acceso" :error="errores.correo" required>
          <input id="pr-correo" v-model.trim="form.correo" type="email" maxlength="120" />
        </FormField>
        <FormField v-if="!editando" id="pr-password" label="Contraseña inicial" :error="errores.password" hint="Mínimo 8 caracteres con letras y números" required>
          <input id="pr-password" v-model="form.password" type="password" autocomplete="new-password" />
        </FormField>
        <FormField id="pr-especialidad" label="Especialidad" :error="errores.especialidad" required>
          <input id="pr-especialidad" v-model.trim="form.especialidad" maxlength="120" />
        </FormField>
        <FormField id="pr-colegiado" label="Número de colegiado" :error="errores.colegiado">
          <input id="pr-colegiado" v-model.trim="form.colegiado" maxlength="30" />
        </FormField>
        <FormField id="pr-telefono" label="Teléfono" :error="errores.telefono" required>
          <input id="pr-telefono" v-model.trim="form.telefono" type="tel" maxlength="20" />
        </FormField>
        <FormField id="pr-foto" label="URL de fotografía" :error="errores.fotografia">
          <input id="pr-foto" v-model.trim="form.fotografia" type="url" placeholder="https://" />
        </FormField>
        <FormField id="pr-descripcion" label="Descripción" :error="errores.descripcion" class="span-all">
          <textarea id="pr-descripcion" v-model.trim="form.descripcion" maxlength="1000"></textarea>
        </FormField>
      </form>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="mostrarFormulario = false">Cancelar</button>
        <button type="submit" form="form-profesional" class="btn btn-primary" :disabled="guardando">Guardar</button>
      </template>
    </BaseModal>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import AvatarImg from '@/components/common/AvatarImg.vue';
import BaseModal from '@/components/common/BaseModal.vue';
import FormField from '@/components/common/FormField.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import profesionalesService from '@/services/profesionales.service';
import { useAuthStore } from '@/stores/auth';
import { useNotificationsStore } from '@/stores/notifications';
import { erroresPorCampo, mensajeError } from '@/utils/errors';
import { ROLES } from '@/utils/roles';
import { correo, minimo, password, requerido, telefono, validarFormulario } from '@/utils/validators';

const auth = useAuthStore();
const notifications = useNotificationsStore();
const esAdmin = computed(() => auth.tieneRol(ROLES.ADMINISTRADOR));

const profesionales = ref([]);
const cargando = ref(false);
const filtros = reactive({ q: '', estado: '' });

const vacio = () => ({
  nombres: '',
  apellidos: '',
  correo: '',
  password: '',
  especialidad: '',
  colegiado: '',
  telefono: '',
  fotografia: '',
  descripcion: ''
});
const form = reactive(vacio());
const errores = ref({});
const editando = ref(null);
const guardando = ref(false);
const mostrarFormulario = ref(false);

async function cargar() {
  cargando.value = true;
  try {
    profesionales.value = await profesionalesService.listar(Object.fromEntries(Object.entries(filtros).filter(([, v]) => v)));
  } catch (error) {
    notifications.error(mensajeError(error));
  } finally {
    cargando.value = false;
  }
}

function abrirFormulario(profesional = null) {
  editando.value = profesional;
  Object.assign(
    form,
    vacio(),
    profesional
      ? {
          nombres: profesional.usuario?.nombres,
          apellidos: profesional.usuario?.apellidos,
          correo: profesional.usuario?.correo,
          especialidad: profesional.especialidad,
          colegiado: profesional.colegiado,
          telefono: profesional.telefono,
          fotografia: profesional.fotografia,
          descripcion: profesional.descripcion
        }
      : {}
  );
  errores.value = {};
  mostrarFormulario.value = true;
}

async function guardar() {
  const reglas = {
    nombres: [requerido, minimo(2)],
    apellidos: [requerido, minimo(2)],
    correo: [requerido, correo],
    especialidad: [requerido, minimo(3)],
    telefono: [requerido, telefono]
  };
  if (!editando.value) {
    reglas.password = [requerido, password];
  }
  errores.value = validarFormulario(form, reglas);
  if (Object.keys(errores.value).length > 0) {
    return;
  }

  guardando.value = true;
  try {
    const { password: clave, ...datos } = form;
    if (editando.value) {
      await profesionalesService.actualizar(editando.value._id, datos);
      notifications.exito('Profesional actualizado correctamente');
    } else {
      await profesionalesService.crear({ ...datos, password: clave });
      notifications.exito('Profesional registrado correctamente');
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

async function alternarEstado(profesional) {
  const estado = profesional.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
  try {
    await profesionalesService.cambiarEstado(profesional._id, estado);
    notifications.exito('Estado del profesional actualizado');
    cargar();
  } catch (error) {
    notifications.error(mensajeError(error));
  }
}

onMounted(cargar);
</script>

<style scoped>
.persona {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.small {
  font-size: 0.8rem;
}
</style>
