<template>
  <div class="admin-layout" :class="{ 'sidebar-open': ui.sidebarOpen }">
    <aside class="admin-sidebar">
      <div class="brand">SIGCA Admin</div>
      <nav class="admin-nav">
        <RouterLink :to="{ name: 'admin-dashboard' }">Panel</RouterLink>
        <RouterLink to="/">Portal público</RouterLink>
      </nav>
    </aside>
    <div class="admin-content">
      <header class="admin-header">
        <button type="button" class="menu-button" @click="ui.toggleSidebar()">Menú</button>
      </header>
      <main class="admin-main">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { useUiStore } from '@/stores/ui';

const ui = useUiStore();
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 240px 1fr;
}

.admin-sidebar {
  background: var(--color-primary);
  color: var(--color-on-primary);
  padding: 1.5rem 1rem;
}

.brand {
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.admin-nav {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.admin-nav a {
  color: inherit;
}

.admin-header {
  display: flex;
  justify-content: flex-end;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.menu-button {
  display: none;
}

.admin-main {
  padding: 1.5rem;
}

@media (max-width: 768px) {
  .admin-layout {
    grid-template-columns: 1fr;
  }

  .admin-sidebar {
    display: none;
  }

  .sidebar-open .admin-sidebar {
    display: block;
  }

  .menu-button {
    display: inline-block;
  }
}
</style>
