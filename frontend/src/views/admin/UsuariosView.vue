<template>
  <section>
    <div class="page-header">
      <h1>Usuarios</h1>
      <button type="button" class="btn btn-primary" @click="abrirFormulario()">Nuevo usuario</button>
    </div>

    <div class="card">
      <form class="toolbar" @submit.prevent="buscar">
        <FormField id="filtro-q" label="Buscar">
          <input id="filtro-q" v-model.trim="filtros.q" type="search" placeholder="Nombre o correo" />
        </FormField>
        <FormField id="filtro-rol" label="Rol">
          <select id="filtro-rol" v-model="filtros.rol">
            <option value="">Todos</option>
            <option v-for="(etiqueta, valor) in ETIQUETAS_ROL" :key="valor" :value="valor">{{ etiqueta }}</option>
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
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="usuario in items" :key="usuario._id">
              <td>{{ usuario.nombreCompleto }}</td>
              <td>{{ usuario.correo }}</td>
              <td>{{ ETIQUETAS_ROL[usuario.rol] }}</td>
              <td><StatusBadge :estado="usuario.estado" /></td>
              <td>
                <div class="actions">
                  <button type="button" class="btn btn-secondary btn-sm" @click="abrirFormulario(usuario)">Editar</button>
                  <button type="button" class="btn btn-secondary btn-sm" @click="abrirPassword(usuario)">Contraseña</button>
                  <button
                    v-if="usuario._id !== auth.usuario?._id"
                    type="button"
                    class="btn btn-sm"
                    :class="usuario.estado === 'ACTIVO' ? 'btn-danger' : 'btn-success'"
                    @click="alternarEstado(usuario)"
                  >
                    {{ usuario.estado === 'ACTIVO' ? 'Desactivar' : 'Activar' }}
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!cargando && items.length === 0">
              <td colspan="5" class="text-muted">No se encontraron usuarios</td>
            </tr>
          </tbody>
        </table>
      </div>
      <PaginationBar :meta="meta" @change="cargar" />
    </div>

    <BaseModal v-model="mostrarFormulario" :title="editando ? 'Editar usuario' : 'Nuevo usuario'">
      <form id="form-usuario" class="form-grid" novalidate @submit.prevent="guardar">
        <FormField id="nombres" label="Nombres" :error="errores.nombres" required>
          <input id="nombres" v-model.trim="form.nombres" maxlength="80" />
        </FormField>
        <FormField id="apellidos" label="Apellidos" :error="errores.apellidos" required>
          <input id="apellidos" v-model.trim="form.apellidos" maxlength="80" />
        </FormField>
        <FormField id="correo" label="Correo electrónico" :error="errores.correo" required>
          <input id="correo" v-model.trim="form.correo" type="email" maxlength="120" />
        </FormField>
        <FormField id="rol" label="Rol" :error="errores.rol" required>
          <select id="rol" v-model="form.rol" :disabled="editando && editando._id === auth.usuario?._id">
            <option value="">Seleccione</option>
            <option v-for="(etiqueta, valor) in ETIQUETAS_ROL" :key="valor" :value="valor">{{ etiqueta }}</option>
          </select>
        </FormField>
        <FormField v-if="!editando" id="password" label="Contraseña" :error="errores.password" hint="Mínimo 8 caracteres con letras y números" required>
          <input id="password" v-model="form.password" type="password" autocomplete="new-password" />
        </FormField>
      </form>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="mostrarFormulario = false">Cancelar</button>
        <button type="submit" form="form-usuario" class="btn btn-primary" :disabled="guardando">Guardar</button>
      </template>
    </BaseModal>

    <BaseModal v-model="mostrarPassword" title="Restablecer contraseña" size="sm">
      <form id="form-password" class="form-stack" novalidate @submit.prevent="guardarPassword">
        <p class="text-muted">Usuario: {{ seleccionado?.nombreCompleto }}</p>
        <FormField id="nueva-password" label="Nueva contraseña" :error="errorPassword" required>
          <input id="nueva-password" v-model="nuevaPassword" type="password" autocomplete="new-password" />
        </FormField>
      </form>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="mostrarPassword = false">Cancelar</button>
        <button type="submit" form="form-password" class="btn btn-primary" :disabled="guardando">Restablecer</button>
      </template>
    </BaseModal>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import BaseModal from '@/components/common/BaseModal.vue';
import FormField from '@/components/common/FormField.vue';
import PaginationBar from '@/components/common/PaginationBar.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { useListado } from '@/composables/useListado';
import usuariosService from '@/services/usuarios.service';
import { useAuthStore } from '@/stores/auth';
import { useNotificationsStore } from '@/stores/notifications';
import { erroresPorCampo, mensajeError } from '@/utils/errors';
import { ETIQUETAS_ROL } from '@/utils/roles';
import { correo, minimo, password, requerido, validarFormulario } from '@/utils/validators';

const auth = useAuthStore();
const notifications = useNotificationsStore();
const { items, meta, cargando, filtros, cargar, buscar } = useListado(usuariosService.listar, { q: '', rol: '', estado: '' });

const vacio = () => ({ nombres: '', apellidos: '', correo: '', rol: '', password: '' });
const form = reactive(vacio());
const errores = ref({});
const editando = ref(null);
const guardando = ref(false);
const mostrarFormulario = ref(false);

const mostrarPassword = ref(false);
const seleccionado = ref(null);
const nuevaPassword = ref('');
const errorPassword = ref('');

function abrirFormulario(usuario = null) {
  editando.value = usuario;
  Object.assign(form, vacio(), usuario ? { nombres: usuario.nombres, apellidos: usuario.apellidos, correo: usuario.correo, rol: usuario.rol } : {});
  errores.value = {};
  mostrarFormulario.value = true;
}

async function guardar() {
  const reglas = {
    nombres: [requerido, minimo(2)],
    apellidos: [requerido, minimo(2)],
    correo: [requerido, correo],
    rol: [requerido]
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
      await usuariosService.actualizar(editando.value._id, datos);
      notifications.exito('Usuario actualizado correctamente');
    } else {
      await usuariosService.crear({ ...datos, password: clave });
      notifications.exito('Usuario registrado correctamente');
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

async function alternarEstado(usuario) {
  const estado = usuario.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
  try {
    await usuariosService.cambiarEstado(usuario._id, estado);
    notifications.exito(`Usuario ${estado === 'ACTIVO' ? 'activado' : 'desactivado'} correctamente`);
    cargar();
  } catch (error) {
    notifications.error(mensajeError(error));
  }
}

function abrirPassword(usuario) {
  seleccionado.value = usuario;
  nuevaPassword.value = '';
  errorPassword.value = '';
  mostrarPassword.value = true;
}

async function guardarPassword() {
  const resultado = requerido(nuevaPassword.value) === true ? password(nuevaPassword.value) : requerido(nuevaPassword.value);
  if (resultado !== true) {
    errorPassword.value = resultado;
    return;
  }
  guardando.value = true;
  try {
    await usuariosService.restablecerPassword(seleccionado.value._id, nuevaPassword.value);
    notifications.exito('Contraseña restablecida correctamente');
    mostrarPassword.value = false;
  } catch (error) {
    notifications.error(mensajeError(error));
  } finally {
    guardando.value = false;
  }
}

onMounted(() => cargar(1));
</script>
