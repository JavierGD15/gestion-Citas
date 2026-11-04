<template>
  <section>
    <div class="page-header">
      <div>
        <h1>Bienvenido, {{ auth.usuario?.nombres }}</h1>
        <p class="text-muted">{{ ETIQUETAS_ROL[auth.rol] }}</p>
      </div>
    </div>
    <div class="card">
      <p>Seleccione un módulo del menú para comenzar.</p>
    </div>
  </section>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { ETIQUETAS_ROL } from '@/utils/roles';

const auth = useAuthStore();
</script>
