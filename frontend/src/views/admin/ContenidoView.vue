<template>
  <section>
    <div class="page-header">
      <h1>Contenido institucional</h1>
      <RouterLink to="/" target="_blank" class="btn btn-secondary">Ver portal</RouterLink>
    </div>

    <div class="tabs">
      <button v-for="tab in tabs" :key="tab.id" type="button" :class="{ active: tabActiva === tab.id }" @click="tabActiva = tab.id">{{ tab.titulo }}</button>
    </div>

    <form v-if="tabActiva === 'general' && general" class="card form-stack" novalidate @submit.prevent="guardarGeneral">
      <div class="form-grid">
        <FormField id="g-nombre" label="Nombre del centro" required>
          <input id="g-nombre" v-model.trim="general.datos.nombreCentro" maxlength="100" />
        </FormField>
        <FormField id="g-eslogan" label="Eslogan">
          <input id="g-eslogan" v-model.trim="general.datos.eslogan" maxlength="200" />
        </FormField>
        <FormField id="g-logo" label="Logotipo (URL)" class="span-all">
          <div class="logo-row">
            <img v-if="general.datos.logo" :src="general.datos.logo" alt="Logotipo" class="logo-preview" />
            <input id="g-logo" v-model.trim="general.datos.logo" type="url" placeholder="https://" />
          </div>
        </FormField>
        <FormField id="g-descripcion" label="Información principal" class="span-all">
          <textarea id="g-descripcion" v-model.trim="general.descripcion" maxlength="5000"></textarea>
        </FormField>
        <FormField id="g-pie" label="Texto del pie de página" class="span-all">
          <input id="g-pie" v-model.trim="general.datos.piePagina" maxlength="300" />
        </FormField>
      </div>

      <div class="section-header">
        <h2>Carrusel de inicio</h2>
        <button type="button" class="btn btn-secondary btn-sm" :disabled="general.datos.carrusel.length >= 12" @click="agregarSlide">Agregar imagen</button>
      </div>
      <p v-if="general.datos.carrusel.length < 5" class="alert alert-warning">Se recomienda configurar al menos 5 imágenes en el carrusel.</p>
      <div v-for="(slide, indice) in general.datos.carrusel" :key="indice" class="slide-row">
        <img v-if="slide.imagen" :src="slide.imagen" alt="" class="slide-preview" />
        <div class="form-grid slide-campos">
          <FormField :id="`slide-img-${indice}`" :label="`Imagen ${indice + 1} (URL)`" class="span-all" required>
            <input :id="`slide-img-${indice}`" v-model.trim="slide.imagen" type="url" placeholder="https://" />
          </FormField>
          <FormField :id="`slide-tit-${indice}`" label="Título">
            <input :id="`slide-tit-${indice}`" v-model.trim="slide.titulo" maxlength="150" />
          </FormField>
          <FormField :id="`slide-desc-${indice}`" label="Descripción">
            <input :id="`slide-desc-${indice}`" v-model.trim="slide.descripcion" maxlength="300" />
          </FormField>
        </div>
        <div class="slide-acciones">
          <button type="button" class="btn btn-secondary btn-sm" :disabled="indice === 0" @click="moverSlide(indice, -1)">↑</button>
          <button type="button" class="btn btn-secondary btn-sm" :disabled="indice === general.datos.carrusel.length - 1" @click="moverSlide(indice, 1)">↓</button>
          <button type="button" class="btn btn-danger btn-sm" @click="general.datos.carrusel.splice(indice, 1)">Quitar</button>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary" :disabled="guardando">Guardar información principal</button>
      </div>
    </form>

    <div v-if="tabActiva === 'mision'" class="grid-2">
      <form v-for="item in [mision, vision].filter(Boolean)" :key="item._id" class="card form-stack" novalidate @submit.prevent="guardarBloque(item)">
        <FormField :id="`${item.clave}-titulo`" label="Título" required>
          <input :id="`${item.clave}-titulo`" v-model.trim="item.titulo" maxlength="200" />
        </FormField>
        <FormField :id="`${item.clave}-descripcion`" label="Descripción" required>
          <textarea :id="`${item.clave}-descripcion`" v-model.trim="item.descripcion" rows="6" maxlength="5000"></textarea>
        </FormField>
        <FormField :id="`${item.clave}-imagen`" label="Imagen (URL)">
          <input :id="`${item.clave}-imagen`" v-model.trim="item.imagen" type="url" placeholder="https://" />
        </FormField>
        <button type="submit" class="btn btn-primary" :disabled="guardando">Guardar {{ item.titulo.toLowerCase() }}</button>
      </form>
    </div>

    <form v-if="tabActiva === 'contacto' && contacto" class="card form-stack" novalidate @submit.prevent="guardarBloque(contacto)">
      <div class="form-grid">
        <FormField id="ct-telefono" label="Teléfono">
          <input id="ct-telefono" v-model.trim="contacto.datos.telefono" maxlength="30" />
        </FormField>
        <FormField id="ct-whatsapp" label="WhatsApp">
          <input id="ct-whatsapp" v-model.trim="contacto.datos.whatsapp" maxlength="30" />
        </FormField>
        <FormField id="ct-correo" label="Correo electrónico">
          <input id="ct-correo" v-model.trim="contacto.datos.correo" type="email" maxlength="120" />
        </FormField>
        <FormField id="ct-direccion" label="Dirección">
          <input id="ct-direccion" v-model.trim="contacto.datos.direccion" maxlength="250" />
        </FormField>
        <FormField id="ct-facebook" label="Facebook (URL)">
          <input id="ct-facebook" v-model.trim="contacto.datos.facebook" type="url" placeholder="https://" />
        </FormField>
        <FormField id="ct-instagram" label="Instagram (URL)">
          <input id="ct-instagram" v-model.trim="contacto.datos.instagram" type="url" placeholder="https://" />
        </FormField>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn btn-primary" :disabled="guardando">Guardar contacto</button>
      </div>
    </form>

    <ContenidoItemsEditor v-if="tabActiva === 'educativo'" tipo="EDUCATIVO" titulo="Publicaciones educativas" @changed="refrescarPortal" />
    <ContenidoItemsEditor v-if="tabActiva === 'corporativo'" tipo="CORPORATIVO" titulo="Actividades corporativas" @changed="refrescarPortal" />

    <form v-if="tabActiva === 'horarios'" class="card" novalidate @submit.prevent="guardarHorarios">
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>Día</th>
              <th>Atención</th>
              <th>Hora de inicio</th>
              <th>Hora de finalización</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="horario in horarios" :key="horario.diaSemana">
              <td>{{ horario.nombreDia }}</td>
              <td>
                <label class="switch">
                  <input v-model="horario.activo" type="checkbox" />
                  {{ horario.activo ? 'Abierto' : 'Cerrado' }}
                </label>
              </td>
              <td><input v-model="horario.horaInicio" type="time" step="900" :disabled="!horario.activo" :aria-label="`Inicio ${horario.nombreDia}`" /></td>
              <td><input v-model="horario.horaFin" type="time" step="900" :disabled="!horario.activo" :aria-label="`Fin ${horario.nombreDia}`" /></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="text-muted">Las citas solo pueden programarse dentro de los horarios configurados.</p>
      <div class="form-actions">
        <button type="submit" class="btn btn-primary" :disabled="guardando">Guardar horarios</button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import ContenidoItemsEditor from '@/components/admin/ContenidoItemsEditor.vue';
import FormField from '@/components/common/FormField.vue';
import contenidoService from '@/services/contenido.service';
import { useNotificationsStore } from '@/stores/notifications';
import { useSitioStore } from '@/stores/sitio';
import { mensajeError } from '@/utils/errors';

const notifications = useNotificationsStore();
const sitio = useSitioStore();

const tabs = [
  { id: 'general', titulo: 'Información principal' },
  { id: 'mision', titulo: 'Misión y visión' },
  { id: 'contacto', titulo: 'Contacto' },
  { id: 'educativo', titulo: 'Contenido educativo' },
  { id: 'corporativo', titulo: 'Corporativo' },
  { id: 'horarios', titulo: 'Horarios' }
];

const tabActiva = ref('general');
const general = ref(null);
const mision = ref(null);
const vision = ref(null);
const contacto = ref(null);
const horarios = ref([]);
const guardando = ref(false);

const clonar = (valor) => JSON.parse(JSON.stringify(valor));

async function cargar() {
  try {
    const [items, listaHorarios] = await Promise.all([contenidoService.listarAdmin(), contenidoService.horarios()]);
    const porClave = (clave) => clonar(items.find((item) => item.clave === clave) || null);
    general.value = porClave('general');
    if (general.value) {
      general.value.datos = { nombreCentro: '', eslogan: '', logo: '', piePagina: '', carrusel: [], ...general.value.datos };
    }
    mision.value = porClave('mision');
    vision.value = porClave('vision');
    contacto.value = porClave('contacto');
    horarios.value = clonar(listaHorarios);
  } catch (error) {
    notifications.error(mensajeError(error));
  }
}

function refrescarPortal() {
  sitio.cargar(true).catch(() => {});
}

function agregarSlide() {
  general.value.datos.carrusel.push({ imagen: '', titulo: '', descripcion: '' });
}

function moverSlide(indice, direccion) {
  const lista = general.value.datos.carrusel;
  const [slide] = lista.splice(indice, 1);
  lista.splice(indice + direccion, 0, slide);
}

async function guardar(item, datos) {
  guardando.value = true;
  try {
    await contenidoService.actualizar(item._id, datos);
    notifications.exito('Contenido actualizado. Los cambios ya son visibles en el portal.');
    refrescarPortal();
    await cargar();
  } catch (error) {
    notifications.error(mensajeError(error));
  } finally {
    guardando.value = false;
  }
}

function guardarGeneral() {
  if (!general.value.datos.nombreCentro || general.value.datos.nombreCentro.length < 3) {
    notifications.error('El nombre del centro debe tener al menos 3 caracteres');
    return;
  }
  if (general.value.datos.carrusel.some((slide) => !/^https?:\/\/\S+$/.test(slide.imagen))) {
    notifications.error('Todas las imágenes del carrusel deben ser URL válidas');
    return;
  }
  guardar(general.value, { descripcion: general.value.descripcion, datos: general.value.datos });
}

function guardarBloque(item) {
  const datos = { titulo: item.titulo, descripcion: item.descripcion, imagen: item.imagen };
  if (item.clave === 'contacto') {
    guardar(item, { datos: item.datos });
  } else {
    guardar(item, datos);
  }
}

async function guardarHorarios() {
  const invalido = horarios.value.find((horario) => horario.activo && horario.horaInicio >= horario.horaFin);
  if (invalido) {
    notifications.error(`En ${invalido.nombreDia} la hora de fin debe ser posterior a la de inicio`);
    return;
  }
  guardando.value = true;
  try {
    horarios.value = await contenidoService.actualizarHorarios(
      horarios.value.map(({ diaSemana, activo, horaInicio, horaFin }) => ({ diaSemana, activo, horaInicio, horaFin }))
    );
    notifications.exito('Horarios actualizados correctamente');
    refrescarPortal();
  } catch (error) {
    notifications.error(mensajeError(error));
  } finally {
    guardando.value = false;
  }
}

onMounted(cargar);
</script>

<style scoped>
.logo-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-preview {
  height: 48px;
  width: auto;
  max-width: 120px;
  object-fit: contain;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.section-header h2 {
  margin: 0;
}

.slide-row {
  display: grid;
  grid-template-columns: 140px 1fr auto;
  gap: 0.75rem;
  align-items: start;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.slide-preview {
  width: 140px;
  aspect-ratio: 12 / 5;
  object-fit: cover;
  border-radius: var(--radius-sm);
}

.slide-acciones {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.switch {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

@media (max-width: 700px) {
  .slide-row {
    grid-template-columns: 1fr;
  }

  .slide-acciones {
    flex-direction: row;
  }
}
</style>
