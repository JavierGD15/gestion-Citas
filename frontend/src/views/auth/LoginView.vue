<template>
  <div class="login-page">
    <form class="card login-card" novalidate @submit.prevent="enviar">
      <RouterLink to="/" class="login-brand">SIGCA</RouterLink>
      <h1>Iniciar sesión</h1>
      <p class="text-muted">Acceso al sistema administrativo</p>

      <FormField id="correo" label="Correo electrónico" :error="errores.correo" required>
        <input id="correo" v-model.trim="form.correo" type="email" autocomplete="username" />
      </FormField>

      <FormField id="password" label="Contraseña" :error="errores.password" required>
        <input id="password" v-model="form.password" type="password" autocomplete="current-password" />
      </FormField>

      <p v-if="errorGeneral" class="alert alert-error">{{ errorGeneral }}</p>

      <button type="submit" class="btn btn-primary btn-block" :disabled="enviando">
        {{ enviando ? 'Ingresando...' : 'Ingresar' }}
      </button>

      <RouterLink to="/" class="back-link">Volver al portal</RouterLink>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import FormField from '@/components/common/FormField.vue';
import { useAuthStore } from '@/stores/auth';
import { mensajeError } from '@/utils/errors';
import { correo, requerido, validarFormulario } from '@/utils/validators';

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

const form = reactive({ correo: '', password: '' });
const errores = ref({});
const errorGeneral = ref('');
const enviando = ref(false);

async function enviar() {
  errorGeneral.value = '';
  errores.value = validarFormulario(form, { correo: [requerido, correo], password: [requerido] });
  if (Object.keys(errores.value).length > 0) {
    return;
  }

  enviando.value = true;
  try {
    await auth.login(form);
    const destino = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/admin') ? route.query.redirect : '/admin';
    router.replace(destino);
  } catch (error) {
    errorGeneral.value = mensajeError(error, 'No fue posible iniciar sesión');
  } finally {
    enviando.value = false;
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
}

.login-card {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.login-brand {
  font-weight: 800;
  font-size: 1.5rem;
}

h1 {
  margin: 0;
}

.back-link {
  text-align: center;
  font-size: 0.875rem;
}
</style>
