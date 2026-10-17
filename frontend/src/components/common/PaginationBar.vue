<template>
  <div v-if="meta && meta.total > 0" class="pagination">
    <span class="text-muted">{{ meta.total }} registro(s) · Página {{ meta.page }} de {{ meta.pages }}</span>
    <div class="actions">
      <button type="button" class="btn btn-secondary btn-sm" :disabled="meta.page <= 1" @click="$emit('change', meta.page - 1)">Anterior</button>
      <button type="button" class="btn btn-secondary btn-sm" :disabled="meta.page >= meta.pages" @click="$emit('change', meta.page + 1)">Siguiente</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  meta: { type: Object, default: null }
});

defineEmits(['change']);
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
  font-size: 0.875rem;
}
</style>
