<template>
  <div class="public-layout">
    <header class="public-header">
      <div class="container header-content">
        <RouterLink to="/" class="brand">SIGCA</RouterLink>
        <nav class="public-nav">
          <RouterLink to="/">Inicio</RouterLink>
          <RouterLink to="/login">Ingresar</RouterLink>
        </nav>
      </div>
    </header>
    <main class="container public-main">
      <RouterView />
    </main>
    <footer class="public-footer">
      <div class="container">© {{ year }} SIGCA</div>
    </footer>
  </div>
</template>

<script setup>
const year = new Date().getFullYear();
</script>

<style scoped>
.public-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.public-header {
  background: var(--color-primary);
  color: var(--color-on-primary);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-block: 1rem;
  flex-wrap: wrap;
}

.brand {
  font-weight: 700;
  font-size: 1.25rem;
  color: inherit;
}

.public-nav {
  display: flex;
  gap: 1rem;
}

.public-nav a {
  color: inherit;
}

.public-main {
  flex: 1;
  padding-block: 2rem;
}

.public-footer {
  background: var(--color-surface-alt);
  padding-block: 1rem;
  font-size: 0.875rem;
}
</style>
