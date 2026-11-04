<template>
  <div class="admin-layout" :class="{ 'sidebar-open': ui.sidebarOpen }">
    <aside class="admin-sidebar">
      <div class="sidebar-brand">
        <span>SIGCA</span>
        <small>Administración</small>
      </div>
      <nav class="admin-nav">
        <RouterLink v-for="item in menu" :key="item.ruta" :to="{ name: item.ruta }" @click="ui.sidebarOpen = false">
          {{ item.titulo }}
        </RouterLink>
      </nav>
      <RouterLink to="/" class="sidebar-portal">Ver portal público</RouterLink>
    </aside>
    <div class="sidebar-backdrop" @click="ui.sidebarOpen = false"></div>
    <div class="admin-content">
      <header class="admin-header">
        <button type="button" class="btn btn-secondary btn-sm menu-button" @click="ui.toggleSidebar()">Menú</button>
        <div class="user-box">
          <div class="user-info">
            <strong>{{ auth.usuario?.nombreCompleto }}</strong>
            <small>{{ ETIQUETAS_ROL[auth.rol] }}</small>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" @click="cerrarSesion">Cerrar sesión</button>
        </div>
      </header>
      <main class="admin-main">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import menuItems from '@/router/menu';
import { useAuthStore } from '@/stores/auth';
import { useUiStore } from '@/stores/ui';
import { ETIQUETAS_ROL } from '@/utils/roles';

const auth = useAuthStore();
const ui = useUiStore();
const router = useRouter();

const menu = computed(() => menuItems.filter((item) => item.roles.includes(auth.rol)));

function cerrarSesion() {
  auth.limpiar();
  router.push({ name: 'login' });
}
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 250px 1fr;
  background: var(--color-surface-alt);
}

.admin-sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  background: var(--color-primary-dark);
  color: var(--color-on-primary);
  padding: 1.25rem 0.75rem;
}

.sidebar-brand {
  display: flex;
  flex-direction: column;
  padding: 0 0.75rem 1.25rem;
  font-weight: 800;
  font-size: 1.25rem;
}

.sidebar-brand small {
  font-weight: 400;
  font-size: 0.8rem;
  opacity: 0.8;
}

.admin-nav {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  flex: 1;
}

.admin-nav a,
.sidebar-portal {
  color: inherit;
  padding: 0.55rem 0.75rem;
  border-radius: var(--radius-sm);
  opacity: 0.9;
}

.admin-nav a:hover,
.admin-nav a.router-link-exact-active {
  background: rgba(255, 255, 255, 0.14);
  opacity: 1;
}

.sidebar-portal {
  margin-top: 1rem;
  font-size: 0.875rem;
}

.sidebar-backdrop {
  display: none;
}

.admin-content {
  min-width: 0;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.user-box {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto;
}

.user-info {
  display: flex;
  flex-direction: column;
  text-align: right;
  line-height: 1.2;
}

.user-info small {
  color: var(--color-muted);
}

.menu-button {
  display: none;
}

.admin-main {
  padding: 1.5rem;
}

@media (max-width: 900px) {
  .admin-layout {
    grid-template-columns: 1fr;
  }

  .admin-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    width: 260px;
    z-index: 200;
    transform: translateX(-100%);
    transition: transform 0.2s ease;
  }

  .sidebar-open .admin-sidebar {
    transform: translateX(0);
  }

  .sidebar-open .sidebar-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 150;
  }

  .menu-button {
    display: inline-flex;
  }

  .admin-header {
    padding: 0.75rem 1rem;
  }

  .admin-main {
    padding: 1rem;
  }

  .user-info {
    display: none;
  }
}
</style>
