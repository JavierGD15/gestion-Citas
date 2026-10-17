<template>
  <section>
    <div class="page-header">
      <h1>Mi cuenta</h1>
    </div>

    <div class="grid-2">
      <div class="card">
        <h2>Información</h2>
        <dl class="detail-list">
          <dt>Nombre</dt>
          <dd>{{ auth.usuario?.nombreCompleto }}</dd>
          <dt>Correo</dt>
          <dd>{{ auth.usuario?.correo }}</dd>
          <dt>Rol</dt>
          <dd>{{ ETIQUETAS_ROL[auth.rol] }}</dd>
        </dl>
      </div>

      <form class="card form-stack" novalidate @submit.prevent="guardar">
        <h2>Cambiar contraseña</h2>
        <FormField id="passwordActual" label="Contraseña actual" :error="errores.passwordActual" required>
          <input id="passwordActual" v-model="form.passwordActual" type="password" autocomplete="current-password" />
        </FormField>
        <FormField id="passwordNueva" label="Nueva contraseña" :error="errores.passwordNueva" hint="Mínimo 8 caracteres con letras y números" required>
          <input id="passwordNueva" v-model="form.passwordNueva" type="password" autocomplete="new-password" />
        </FormField>
        <FormField id="confirmacion" label="Confirmar contraseña" :error="errores.confirmacion" required>
          <input id="confirmacion" v-model="form.confirmacion" type="password" autocomplete="new-password" />
        </FormField>
        <button type="submit" class="btn btn-primary" :disabled="guardando">Actualizar contraseña</button>
      </form>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue';
import FormField from '@/components/common/FormField.vue';
import authService from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth';
import { useNotificationsStore } from '@/stores/notifications';
import { ETIQUETAS_ROL } from '@/utils/roles';
import { mensajeError } from '@/utils/errors';
import { password, requerido, validarFormulario } from '@/utils/validators';

const auth = useAuthStore();
const notifications = useNotificationsStore();

const form = reactive({ passwordActual: '', passwordNueva: '', confirmacion: '' });
const errores = ref({});
const guardando = ref(false);

const coincide = (valor, valores) => valor === valores.passwordNueva || 'Las contraseñas no coinciden';

async function guardar() {
  errores.value = validarFormulario(form, {
    passwordActual: [requerido],
    passwordNueva: [requerido, password],
    confirmacion: [requerido, coincide]
  });
  if (Object.keys(errores.value).length > 0) {
    return;
  }

  guardando.value = true;
  try {
    await authService.cambiarPassword({ passwordActual: form.passwordActual, passwordNueva: form.passwordNueva });
    notifications.exito('Contraseña actualizada correctamente');
    Object.assign(form, { passwordActual: '', passwordNueva: '', confirmacion: '' });
  } catch (error) {
    notifications.error(mensajeError(error));
  } finally {
    guardando.value = false;
  }
}
</script>
