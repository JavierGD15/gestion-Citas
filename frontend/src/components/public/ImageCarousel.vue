<template>
  <div class="carousel" @mouseenter="pausar" @mouseleave="reanudar">
    <div class="carousel-track" :style="{ transform: `translateX(-${actual * 100}%)` }">
      <div v-for="(slide, indice) in slides" :key="indice" class="carousel-slide">
        <img v-if="slide.imagen" :src="slide.imagen" :alt="slide.titulo || `Imagen ${indice + 1}`" />
        <div v-else class="carousel-placeholder"></div>
        <div v-if="slide.titulo || slide.descripcion" class="carousel-caption">
          <h2 v-if="slide.titulo">{{ slide.titulo }}</h2>
          <p v-if="slide.descripcion">{{ slide.descripcion }}</p>
        </div>
      </div>
    </div>
    <template v-if="slides.length > 1">
      <button type="button" class="carousel-control prev" aria-label="Anterior" @click="anterior">‹</button>
      <button type="button" class="carousel-control next" aria-label="Siguiente" @click="siguiente">›</button>
      <div class="carousel-dots">
        <button
          v-for="(slide, indice) in slides"
          :key="indice"
          type="button"
          :class="{ active: indice === actual }"
          :aria-label="`Ir a la imagen ${indice + 1}`"
          @click="irA(indice)"
        ></button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps({
  slides: { type: Array, default: () => [] },
  intervalo: { type: Number, default: 5000 }
});

const actual = ref(0);
let temporizador = null;

function siguiente() {
  actual.value = (actual.value + 1) % props.slides.length;
}

function anterior() {
  actual.value = (actual.value - 1 + props.slides.length) % props.slides.length;
}

function irA(indice) {
  actual.value = indice;
}

function pausar() {
  clearInterval(temporizador);
  temporizador = null;
}

function reanudar() {
  pausar();
  if (props.slides.length > 1) {
    temporizador = setInterval(siguiente, props.intervalo);
  }
}

watch(
  () => props.slides.length,
  () => {
    actual.value = 0;
    reanudar();
  }
);

onMounted(reanudar);
onBeforeUnmount(pausar);
</script>

<style scoped>
.carousel {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius);
  aspect-ratio: 12 / 5;
  min-height: 220px;
  background: var(--color-primary-dark);
}

.carousel-track {
  display: flex;
  height: 100%;
  transition: transform 0.6s ease;
}

.carousel-slide {
  position: relative;
  flex: 0 0 100%;
  height: 100%;
}

.carousel-slide img,
.carousel-placeholder {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-placeholder {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
}

.carousel-caption {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 2rem 1.5rem 2.5rem;
  color: #fff;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.65));
}

.carousel-caption h2 {
  margin: 0 0 0.25rem;
  font-size: clamp(1.1rem, 3vw, 1.8rem);
}

.carousel-caption p {
  margin: 0;
  max-width: 640px;
}

.carousel-control {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.85);
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
}

.prev {
  left: 0.75rem;
}

.next {
  right: 0.75rem;
}

.carousel-dots {
  position: absolute;
  bottom: 0.75rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.4rem;
}

.carousel-dots button {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 0;
}

.carousel-dots button.active {
  background: #fff;
}

@media (max-width: 600px) {
  .carousel {
    aspect-ratio: 4 / 3;
  }

  .carousel-control {
    display: none;
  }
}
</style>
