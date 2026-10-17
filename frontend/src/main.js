import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { configurarSesion } from './services/api';
import { useAuthStore } from './stores/auth';
import './assets/styles/main.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

const auth = useAuthStore(pinia);

configurarSesion({
  tokenProvider: () => auth.token,
  unauthorizedHandler: () => {
    auth.limpiar();
    if (router.currentRoute.value.meta.requiresAuth) {
      router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } });
    }
  }
});

app.use(router);

app.mount('#app');
