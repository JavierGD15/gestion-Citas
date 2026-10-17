<template>
  <img v-if="src && !fallo" :src="src" :alt="nombre" class="avatar-img" :style="estilo" @error="fallo = true" />
  <span v-else class="avatar-iniciales" :style="estilo">{{ iniciales }}</span>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

const props = defineProps({
  src: { type: String, default: '' },
  nombre: { type: String, default: '' },
  size: { type: Number, default: 40 }
});

const fallo = ref(false);

watch(
  () => props.src,
  () => {
    fallo.value = false;
  }
);

const iniciales = computed(() =>
  props.nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join('')
);

const estilo = computed(() => ({ width: `${props.size}px`, height: `${props.size}px`, fontSize: `${props.size * 0.38}px` }));
</script>

<style scoped>
.avatar-img,
.avatar-iniciales {
  border-radius: 50%;
  flex-shrink: 0;
}

.avatar-img {
  object-fit: cover;
}

.avatar-iniciales {
  display: inline-grid;
  place-items: center;
  background: var(--color-primary-soft);
  color: var(--color-primary-dark);
  font-weight: 700;
}
</style>
