<template>
  <div class="public-layout">
    <header class="public-header">
      <div class="container header-content">
        <RouterLink to="/" class="brand" @click="menuAbierto = false">
          <img v-if="sitio.logo" :src="sitio.logo" :alt="sitio.nombreCentro" class="brand-logo" />
          <span v-else class="brand-mark">{{ sitio.nombreCentro.charAt(0) }}</span>
          <span class="brand-name">{{ sitio.nombreCentro }}</span>
        </RouterLink>
        <button type="button" class="nav-toggle" :aria-expanded="menuAbierto" aria-label="Abrir menú" @click="menuAbierto = !menuAbierto">☰</button>
        <nav class="public-nav" :class="{ open: menuAbierto }" @click="menuAbierto = false">
          <RouterLink v-for="item in enlaces" :key="item.ruta" :to="{ name: item.ruta }">{{ item.titulo }}</RouterLink>
          <RouterLink v-if="tieneRuta('solicitar-cita')" :to="{ name: 'solicitar-cita' }" class="btn btn-accent btn-sm">Solicitar cita</RouterLink>
          <RouterLink :to="{ name: 'login' }" class="nav-login">Ingresar</RouterLink>
        </nav>
      </div>
    </header>

    <main class="public-main">
      <RouterView />
    </main>

    <footer class="public-footer">
      <div class="container footer-grid">
        <div>
          <strong>{{ sitio.nombreCentro }}</strong>
          <p>{{ sitio.general.piePagina }}</p>
        </div>
        <div>
          <strong>Contacto</strong>
          <p v-if="sitio.contacto.telefono">Teléfono: {{ sitio.contacto.telefono }}</p>
          <p v-if="sitio.contacto.correo">Correo: {{ sitio.contacto.correo }}</p>
          <p v-if="sitio.contacto.direccion">{{ sitio.contacto.direccion }}</p>
        </div>
        <div>
          <strong>Horarios</strong>
          <p v-for="horario in sitio.horariosActivos" :key="horario._id">{{ horario.nombreDia }}: {{ horario.horaInicio }} – {{ horario.horaFin }}</p>
        </div>
      </div>
      <div class="container footer-bottom">© {{ year }} {{ sitio.nombreCentro }}</div>
    </footer>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useSitioStore } from '@/stores/sitio';

const sitio = useSitioStore();
const router = useRouter();
const menuAbierto = ref(false);
const year = new Date().getFullYear();

const enlaces = [
  { titulo: 'Inicio', ruta: 'inicio' },
  { titulo: 'Nosotros', ruta: 'nosotros' },
  { titulo: 'Servicios', ruta: 'servicios' },
  { titulo: 'Educativo', ruta: 'educativo' },
  { titulo: 'Corporativo', ruta: 'corporativo' },
  { titulo: 'Horarios', ruta: 'horarios' },
  { titulo: 'Contacto', ruta: 'contacto' }
];

const tieneRuta = (nombre) => router.hasRoute(nombre);

onMounted(() => {
  sitio.cargar().catch(() => {});
});
</script>

<style scoped>
.public-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.public-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-block: 0.75rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--color-primary-dark);
  font-weight: 800;
  font-size: 1.1rem;
}

.brand-logo {
  height: 44px;
  width: auto;
  max-width: 120px;
  object-fit: contain;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
}

.public-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.public-nav a {
  color: var(--color-text);
  font-weight: 500;
}

.public-nav a.router-link-exact-active:not(.btn) {
  color: var(--color-primary);
}

.public-nav .btn-accent {
  color: #1f2933;
}

.nav-login {
  color: var(--color-primary) !important;
}

.nav-toggle {
  display: none;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: var(--radius-sm);
  padding: 0.35rem 0.7rem;
  font-size: 1.2rem;
  cursor: pointer;
}

.public-main {
  flex: 1;
}

.public-footer {
  background: var(--color-primary-dark);
  color: #e8f1f6;
  padding-top: 2rem;
  margin-top: 3rem;
  font-size: 0.925rem;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

.footer-grid p {
  margin: 0.25rem 0;
}

.footer-bottom {
  padding-block: 1rem;
  margin-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  font-size: 0.85rem;
}

@media (max-width: 960px) {
  .nav-toggle {
    display: inline-block;
  }

  .public-nav {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    padding: 0.5rem 1rem 1rem;
  }

  .public-nav.open {
    display: flex;
  }

  .public-nav a {
    padding: 0.6rem 0;
  }

  .public-nav .btn {
    margin-top: 0.5rem;
  }
}
</style>
