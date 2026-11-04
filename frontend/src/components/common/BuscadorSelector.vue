<template>
  <div class="buscador">
    <div v-if="modelValue" class="seleccionado">
      <AvatarImg v-if="conAvatar" :src="modelValue.fotografia" :nombre="etiqueta(modelValue)" :size="36" />
      <div class="seleccionado-texto">
        <strong>{{ etiqueta(modelValue) }}</strong>
        <small v-if="detalle(modelValue)" class="text-muted">{{ detalle(modelValue) }}</small>
      </div>
      <button v-if="!disabled" type="button" class="btn btn-secondary btn-sm" @click="limpiar">Cambiar</button>
    </div>
    <template v-else>
      <input
        :id="id"
        v-model="texto"
        type="search"
        autocomplete="off"
        :placeholder="placeholder"
        :disabled="disabled"
        @input="buscarDiferido"
        @focus="abierto = true"
        @blur="cerrarDiferido"
      />
      <ul v-if="abierto && resultados.length > 0" class="resultados">
        <li v-for="item in resultados" :key="item._id" @mousedown.prevent="seleccionar(item)">
          <AvatarImg v-if="conAvatar" :src="item.fotografia" :nombre="etiqueta(item)" :size="32" />
          <div>
            <strong>{{ etiqueta(item) }}</strong>
            <small v-if="detalle(item)" class="text-muted">{{ detalle(item) }}</small>
          </div>
        </li>
      </ul>
      <small v-if="abierto && buscado && resultados.length === 0 && !buscando" class="text-muted">Sin resultados</small>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AvatarImg from './AvatarImg.vue';

const props = defineProps({
  modelValue: { type: Object, default: null },
  fetcher: { type: Function, required: true },
  etiqueta: { type: Function, default: (item) => item.nombreCompleto || item.nombre || '' },
  detalle: { type: Function, default: () => '' },
  placeholder: { type: String, default: 'Escriba para buscar' },
  id: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  conAvatar: { type: Boolean, default: true }
});

const emit = defineEmits(['update:modelValue']);

const texto = ref('');
const resultados = ref([]);
const abierto = ref(false);
const buscado = ref(false);
const buscando = ref(false);
let temporizador = null;

function buscarDiferido() {
  clearTimeout(temporizador);
  temporizador = setTimeout(buscar, 300);
}

async function buscar() {
  if (texto.value.trim().length < 2) {
    resultados.value = [];
    buscado.value = false;
    return;
  }
  buscando.value = true;
  try {
    resultados.value = await props.fetcher(texto.value.trim());
  } catch {
    resultados.value = [];
  } finally {
    buscado.value = true;
    buscando.value = false;
  }
}

function seleccionar(item) {
  emit('update:modelValue', item);
  texto.value = '';
  resultados.value = [];
  abierto.value = false;
}

function limpiar() {
  emit('update:modelValue', null);
}

function cerrarDiferido() {
  setTimeout(() => {
    abierto.value = false;
  }, 150);
}
</script>

<style scoped>
.buscador {
  position: relative;
}

.seleccionado {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface-alt);
}

.seleccionado-texto {
  display: flex;
  flex-direction: column;
  flex: 1;
  line-height: 1.25;
}

.resultados {
  position: absolute;
  left: 0;
  right: 0;
  top: 100%;
  z-index: 50;
  margin: 0.25rem 0 0;
  padding: 0.25rem 0;
  list-style: none;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow);
  max-height: 260px;
  overflow-y: auto;
}

.resultados li {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
}

.resultados li div {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}

.resultados li:hover {
  background: var(--color-primary-soft);
}
</style>
