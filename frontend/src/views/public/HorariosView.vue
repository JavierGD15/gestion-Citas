<template>
  <section class="container page">
    <h1>Horarios de atención</h1>
    <div class="card horarios">
      <div v-for="horario in sitio.horarios" :key="horario._id" class="horario" :class="{ cerrado: !horario.activo }">
        <strong>{{ horario.nombreDia }}</strong>
        <span>{{ horario.activo ? `${horario.horaInicio} – ${horario.horaFin}` : 'Cerrado' }}</span>
      </div>
    </div>
    <p class="text-muted nota">Las citas se programan dentro de estos horarios de atención.</p>
  </section>
</template>

<script setup>
import { useSitioStore } from '@/stores/sitio';

const sitio = useSitioStore();
</script>

<style scoped>
.page {
  padding-block: 2rem;
  max-width: 640px;
}

.horarios {
  padding: 0;
}

.horario {
  display: flex;
  justify-content: space-between;
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
}

.horario:last-child {
  border-bottom: none;
}

.cerrado {
  color: var(--color-muted);
}

.nota {
  margin-top: 1rem;
}
</style>
