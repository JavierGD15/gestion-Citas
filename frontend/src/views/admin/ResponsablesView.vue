<template>
  <section>
    <div class="page-header">
      <h1>Responsables</h1>
      <button type="button" class="btn btn-primary" @click="abrirFormulario()">Registrar responsable</button>
    </div>

    <div class="card">
      <form class="toolbar" @submit.prevent="buscar">
        <FormField id="filtro-q" label="Buscar">
          <input id="filtro-q" v-model.trim="filtros.q" type="search" placeholder="Nombre, código, teléfono o correo" />
        </FormField>
        <button type="submit" class="btn btn-secondary">Buscar</button>
      </form>

      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>Responsable</th>
              <th>Parentesco</th>
              <th>Contacto</th>
              <th>Pacientes asociados</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="responsable in items" :key="responsable._id">
              <td>
                <div class="persona">
                  <AvatarImg :src="responsable.fotografia" :nombre="responsable.nombreCompleto" />
                  <div>
                    <strong>{{ responsable.nombreCompleto }}</strong>
                    <div class="text-muted">{{ responsable.codigo }}</div>
                  </div>
                </div>
              </td>
              <td>{{ responsable.parentesco }}</td>
              <td>
                <div>{{ responsable.telefono }}</div>
                <div class="text-muted">{{ responsable.correo }}</div>
              </td>
              <td>
                <div v-for="paciente in responsable.pacientes" :key="paciente._id" class="chip">
                  <RouterLink :to="{ name: 'admin-paciente-detalle', params: { id: paciente._id } }">{{ paciente.nombres }} {{ paciente.apellidos }}</RouterLink>
                  <button type="button" class="chip-remove" title="Desasociar" @click="desasociar(responsable, paciente)">×</button>
                </div>
                <span v-if="responsable.pacientes.length === 0" class="text-muted">Sin pacientes</span>
              </td>
              <td>
                <div class="actions">
                  <button type="button" class="btn btn-secondary btn-sm" @click="abrirFormulario(responsable)">Editar</button>
                  <button type="button" class="btn btn-secondary btn-sm" @click="abrirAsociar(responsable)">Asociar paciente</button>
                </div>
              </td>
            </tr>
            <tr v-if="!cargando && items.length === 0">
              <td colspan="5" class="text-muted">No se encontraron responsables</td>
            </tr>
          </tbody>
        </table>
      </div>
      <PaginationBar :meta="meta" @change="cargar" />
    </div>

    <ResponsableForm v-model="mostrarFormulario" :responsable="seleccionado" @saved="cargar()" />

    <BaseModal v-model="mostrarAsociar" title="Asociar paciente">
      <p class="text-muted">Responsable: {{ seleccionado?.nombreCompleto }}</p>
      <FormField id="asociar-paciente" label="Paciente" required>
        <BuscadorSelector
          id="asociar-paciente"
          v-model="pacienteAsociar"
          :fetcher="buscarPacientes"
          :detalle="(p) => `${p.codigo} · ${p.edad} años`"
          placeholder="Buscar paciente por nombre o código"
        />
      </FormField>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="mostrarAsociar = false">Cancelar</button>
        <button type="button" class="btn btn-primary" :disabled="!pacienteAsociar" @click="asociar">Asociar</button>
      </template>
    </BaseModal>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import ResponsableForm from '@/components/admin/ResponsableForm.vue';
import AvatarImg from '@/components/common/AvatarImg.vue';
import BaseModal from '@/components/common/BaseModal.vue';
import BuscadorSelector from '@/components/common/BuscadorSelector.vue';
import FormField from '@/components/common/FormField.vue';
import PaginationBar from '@/components/common/PaginationBar.vue';
import { useListado } from '@/composables/useListado';
import { buscarPacientes } from '@/services/pacientes.service';
import responsablesService from '@/services/responsables.service';
import { useNotificationsStore } from '@/stores/notifications';
import { mensajeError } from '@/utils/errors';

const notifications = useNotificationsStore();
const { items, meta, cargando, filtros, cargar, buscar } = useListado(responsablesService.listar, { q: '' });

const mostrarFormulario = ref(false);
const mostrarAsociar = ref(false);
const seleccionado = ref(null);
const pacienteAsociar = ref(null);

function abrirFormulario(responsable = null) {
  seleccionado.value = responsable;
  mostrarFormulario.value = true;
}

function abrirAsociar(responsable) {
  seleccionado.value = responsable;
  pacienteAsociar.value = null;
  mostrarAsociar.value = true;
}

async function asociar() {
  try {
    await responsablesService.asociarPaciente(seleccionado.value._id, pacienteAsociar.value._id);
    notifications.exito('Paciente asociado correctamente');
    mostrarAsociar.value = false;
    cargar();
  } catch (error) {
    notifications.error(mensajeError(error));
  }
}

async function desasociar(responsable, paciente) {
  try {
    await responsablesService.desasociarPaciente(responsable._id, paciente._id);
    notifications.exito('Paciente desasociado');
    cargar();
  } catch (error) {
    notifications.error(mensajeError(error));
  }
}

onMounted(() => cargar(1));
</script>

<style scoped>
.persona {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin: 0 0.25rem 0.25rem 0;
  padding: 0.1rem 0.25rem 0.1rem 0.6rem;
  border-radius: 999px;
  background: var(--color-primary-soft);
  font-size: 0.85rem;
}

.chip-remove {
  border: none;
  background: none;
  cursor: pointer;
  color: var(--color-muted);
  font-size: 1rem;
  line-height: 1;
}
</style>
