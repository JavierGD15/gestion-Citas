<template>
  <div class="card">
    <div class="section-header">
      <h2>{{ titulo }}</h2>
      <button type="button" class="btn btn-primary btn-sm" @click="abrir()">Agregar</button>
    </div>
    <div class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>Título</th>
            <th v-if="tipo === 'EDUCATIVO'">Publicación</th>
            <th v-else>Categoría</th>
            <th>Orden</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item._id">
            <td>
              <div class="item">
                <img v-if="item.imagen || item.imagenes?.[0]" :src="item.imagen || item.imagenes[0]" alt="" class="thumb" />
                <div>
                  <strong>{{ item.titulo }}</strong>
                  <div class="text-muted descripcion">{{ item.descripcion }}</div>
                </div>
              </div>
            </td>
            <td v-if="tipo === 'EDUCATIVO'">{{ formatearFecha(item.fechaPublicacion) }}</td>
            <td v-else>{{ CATEGORIAS_CORPORATIVO[item.categoria] }}</td>
            <td>{{ item.orden }}</td>
            <td><StatusBadge :estado="item.estado" :etiquetas="{ ACTIVO: 'Publicado', INACTIVO: 'Oculto' }" /></td>
            <td>
              <div class="actions">
                <button type="button" class="btn btn-secondary btn-sm" @click="abrir(item)">Editar</button>
                <button type="button" class="btn btn-secondary btn-sm" @click="alternar(item)">{{ item.estado === 'ACTIVO' ? 'Ocultar' : 'Publicar' }}</button>
              </div>
            </td>
          </tr>
          <tr v-if="items.length === 0">
            <td colspan="5" class="text-muted">No hay registros</td>
          </tr>
        </tbody>
      </table>
    </div>

    <BaseModal v-model="mostrar" :title="editando ? 'Editar' : 'Agregar'" size="lg">
      <form :id="`form-${tipo}`" class="form-grid" novalidate @submit.prevent="guardar">
        <FormField :id="`${tipo}-titulo`" label="Título" :error="errores.titulo" class="span-all" required>
          <input :id="`${tipo}-titulo`" v-model.trim="form.titulo" maxlength="200" />
        </FormField>
        <FormField :id="`${tipo}-descripcion`" label="Descripción" :error="errores.descripcion" class="span-all" required>
          <textarea :id="`${tipo}-descripcion`" v-model.trim="form.descripcion" rows="5" maxlength="5000"></textarea>
        </FormField>
        <FormField v-if="tipo === 'EDUCATIVO'" :id="`${tipo}-fecha`" label="Fecha de publicación" :error="errores.fechaPublicacion" required>
          <input :id="`${tipo}-fecha`" v-model="form.fechaPublicacion" type="date" />
        </FormField>
        <FormField v-else :id="`${tipo}-categoria`" label="Categoría" :error="errores.categoria" required>
          <select :id="`${tipo}-categoria`" v-model="form.categoria">
            <option value="">Seleccione</option>
            <option v-for="(etiqueta, valor) in CATEGORIAS_CORPORATIVO" :key="valor" :value="valor">{{ etiqueta }}</option>
          </select>
        </FormField>
        <FormField :id="`${tipo}-orden`" label="Orden">
          <input :id="`${tipo}-orden`" v-model.number="form.orden" type="number" min="0" max="999" />
        </FormField>
        <FormField :id="`${tipo}-imagen`" label="Imagen principal (URL)" :error="errores.imagen" class="span-all">
          <input :id="`${tipo}-imagen`" v-model.trim="form.imagen" type="url" placeholder="https://" />
        </FormField>
        <FormField v-if="tipo === 'EDUCATIVO'" :id="`${tipo}-enlace`" label="Enlace opcional" :error="errores.enlace" class="span-all">
          <input :id="`${tipo}-enlace`" v-model.trim="form.enlace" type="url" placeholder="https://" />
        </FormField>
        <FormField v-else :id="`${tipo}-imagenes`" label="Imágenes relacionadas (una URL por línea)" :error="errores.imagenes" class="span-all">
          <textarea :id="`${tipo}-imagenes`" v-model="form.imagenesTexto" rows="3"></textarea>
        </FormField>
      </form>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="mostrar = false">Cancelar</button>
        <button type="submit" :form="`form-${tipo}`" class="btn btn-primary" :disabled="guardando">Guardar</button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import BaseModal from '@/components/common/BaseModal.vue';
import FormField from '@/components/common/FormField.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import contenidoService from '@/services/contenido.service';
import { useNotificationsStore } from '@/stores/notifications';
import { CATEGORIAS_CORPORATIVO } from '@/utils/catalogos';
import { mensajeError } from '@/utils/errors';
import { fechaISO, formatearFecha } from '@/utils/format';
import { minimo, requerido, validarFormulario } from '@/utils/validators';

const props = defineProps({
  tipo: { type: String, required: true },
  titulo: { type: String, required: true }
});

const emit = defineEmits(['changed']);
const notifications = useNotificationsStore();

const items = ref([]);
const mostrar = ref(false);
const editando = ref(null);
const guardando = ref(false);
const errores = ref({});
const vacio = () => ({ titulo: '', descripcion: '', fechaPublicacion: fechaISO(), categoria: '', orden: 0, imagen: '', enlace: '', imagenesTexto: '' });
const form = reactive(vacio());

const url = (valor) => !valor || /^https?:\/\/\S+$/.test(valor) || 'Ingrese una URL que inicie con http:// o https://';

async function cargar() {
  try {
    items.value = await contenidoService.listarAdmin({ tipo: props.tipo });
  } catch (error) {
    notifications.error(mensajeError(error));
  }
}

function abrir(item = null) {
  editando.value = item;
  Object.assign(
    form,
    vacio(),
    item
      ? {
          titulo: item.titulo,
          descripcion: item.descripcion,
          fechaPublicacion: item.fechaPublicacion?.slice(0, 10) || fechaISO(),
          categoria: item.categoria || '',
          orden: item.orden,
          imagen: item.imagen,
          enlace: item.enlace,
          imagenesTexto: (item.imagenes || []).join('\n')
        }
      : {}
  );
  errores.value = {};
  mostrar.value = true;
}

async function guardar() {
  const reglas = { titulo: [requerido, minimo(3)], descripcion: [requerido, minimo(5)], imagen: [url] };
  if (props.tipo === 'EDUCATIVO') {
    reglas.fechaPublicacion = [requerido];
    reglas.enlace = [url];
  } else {
    reglas.categoria = [requerido];
  }
  errores.value = validarFormulario(form, reglas);
  const imagenes = form.imagenesTexto
    .split('\n')
    .map((linea) => linea.trim())
    .filter(Boolean);
  if (imagenes.some((imagen) => url(imagen) !== true)) {
    errores.value.imagenes = 'Todas las imágenes deben ser URL válidas';
  }
  if (Object.keys(errores.value).length > 0) {
    return;
  }

  const datos = { titulo: form.titulo, descripcion: form.descripcion, orden: form.orden || 0, imagen: form.imagen };
  if (props.tipo === 'EDUCATIVO') {
    Object.assign(datos, { fechaPublicacion: form.fechaPublicacion, enlace: form.enlace });
  } else {
    Object.assign(datos, { categoria: form.categoria, imagenes });
  }

  guardando.value = true;
  try {
    if (editando.value) {
      await contenidoService.actualizar(editando.value._id, datos);
    } else {
      await contenidoService.crear({ ...datos, tipo: props.tipo });
    }
    notifications.exito('Contenido guardado correctamente');
    mostrar.value = false;
    await cargar();
    emit('changed');
  } catch (error) {
    notifications.error(mensajeError(error));
  } finally {
    guardando.value = false;
  }
}

async function alternar(item) {
  try {
    await contenidoService.cambiarEstado(item._id, item.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO');
    notifications.exito('Estado actualizado');
    await cargar();
    emit('changed');
  } catch (error) {
    notifications.error(mensajeError(error));
  }
}

onMounted(cargar);
</script>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h2 {
  margin: 0;
}

.item {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.thumb {
  width: 64px;
  height: 44px;
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
