<template>
  <section class="container page">
    <h1>Contacto</h1>
    <div class="contacto-grid">
      <form class="card form-stack" novalidate @submit.prevent="enviar">
        <h2>Envíenos un mensaje</h2>
        <FormField id="nombre" label="Nombre" :error="errores.nombre" required>
          <input id="nombre" v-model.trim="form.nombre" maxlength="120" autocomplete="name" />
        </FormField>
        <div class="form-grid">
          <FormField id="correo" label="Correo electrónico" :error="errores.correo" required>
            <input id="correo" v-model.trim="form.correo" type="email" maxlength="120" autocomplete="email" />
          </FormField>
          <FormField id="telefono" label="Teléfono" :error="errores.telefono" required>
            <input id="telefono" v-model.trim="form.telefono" type="tel" maxlength="20" autocomplete="tel" />
          </FormField>
        </div>
        <FormField id="asunto" label="Asunto" :error="errores.asunto" required>
          <input id="asunto" v-model.trim="form.asunto" maxlength="150" />
        </FormField>
        <FormField id="mensaje" label="Mensaje" :error="errores.mensaje" required>
          <textarea id="mensaje" v-model.trim="form.mensaje" rows="5" maxlength="2000"></textarea>
        </FormField>
        <button type="submit" class="btn btn-primary" :disabled="enviando">{{ enviando ? 'Enviando...' : 'Enviar mensaje' }}</button>
      </form>

      <aside class="card info">
        <h2>Información</h2>
        <dl class="detail-list">
          <template v-if="sitio.contacto.telefono">
            <dt>Teléfono</dt>
            <dd>{{ sitio.contacto.telefono }}</dd>
          </template>
          <template v-if="sitio.contacto.whatsapp">
            <dt>WhatsApp</dt>
            <dd>{{ sitio.contacto.whatsapp }}</dd>
          </template>
          <template v-if="sitio.contacto.correo">
            <dt>Correo</dt>
            <dd>{{ sitio.contacto.correo }}</dd>
          </template>
          <template v-if="sitio.contacto.direccion">
            <dt>Dirección</dt>
            <dd>{{ sitio.contacto.direccion }}</dd>
          </template>
        </dl>
        <div class="redes">
          <a v-if="sitio.contacto.facebook" :href="sitio.contacto.facebook" target="_blank" rel="noopener noreferrer">Facebook</a>
          <a v-if="sitio.contacto.instagram" :href="sitio.contacto.instagram" target="_blank" rel="noopener noreferrer">Instagram</a>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue';
import FormField from '@/components/common/FormField.vue';
import portalService from '@/services/portal.service';
import { useNotificationsStore } from '@/stores/notifications';
import { useSitioStore } from '@/stores/sitio';
import { erroresPorCampo, mensajeError } from '@/utils/errors';
import { correo, minimo, requerido, telefono, validarFormulario } from '@/utils/validators';

const sitio = useSitioStore();
const notifications = useNotificationsStore();

const vacio = () => ({ nombre: '', correo: '', telefono: '', asunto: '', mensaje: '' });
const form = reactive(vacio());
const errores = ref({});
const enviando = ref(false);

async function enviar() {
  errores.value = validarFormulario(form, {
    nombre: [requerido, minimo(3)],
    correo: [requerido, correo],
    telefono: [requerido, telefono],
    asunto: [requerido, minimo(3)],
    mensaje: [requerido, minimo(10)]
  });
  if (Object.keys(errores.value).length > 0) {
    return;
  }

  enviando.value = true;
  try {
    const respuesta = await portalService.enviarContacto(form);
    notifications.exito(respuesta.message);
    Object.assign(form, vacio());
  } catch (error) {
    errores.value = erroresPorCampo(error);
    notifications.error(mensajeError(error));
  } finally {
    enviando.value = false;
  }
}
</script>

<style scoped>
.page {
  padding-block: 2rem;
}

.contacto-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  align-items: start;
}

.redes {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

@media (max-width: 800px) {
  .contacto-grid {
    grid-template-columns: 1fr;
  }
}
</style>
