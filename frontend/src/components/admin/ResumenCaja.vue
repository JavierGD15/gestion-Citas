<template>
  <div class="resumen-caja">
    <div class="grid-3">
      <div class="card stat-card">
        <span class="stat-label">Monto inicial</span>
        <span class="stat-value">{{ formatearMoneda(resumen.montoInicial) }}</span>
      </div>
      <div class="card stat-card">
        <span class="stat-label">Pagos en efectivo</span>
        <span class="stat-value">{{ formatearMoneda(resumen.totalEfectivo) }}</span>
      </div>
      <div class="card stat-card">
        <span class="stat-label">Pagos por transferencia</span>
        <span class="stat-value">{{ formatearMoneda(resumen.totalTransferencia) }}</span>
      </div>
      <div class="card stat-card">
        <span class="stat-label">Pagos con tarjeta</span>
        <span class="stat-value">{{ formatearMoneda(resumen.totalTarjeta) }}</span>
      </div>
      <div class="card stat-card destacado">
        <span class="stat-label">Total de ingresos</span>
        <span class="stat-value">{{ formatearMoneda(resumen.totalIngresos) }}</span>
        <small class="text-muted">{{ resumen.cantidadPagos }} pago(s) válidos · {{ resumen.cantidadAnulados || 0 }} anulado(s)</small>
      </div>
      <div class="card stat-card destacado">
        <span class="stat-label">Efectivo esperado</span>
        <span class="stat-value">{{ formatearMoneda(resumen.efectivoEsperado) }}</span>
        <small class="text-muted">{{ formatearMoneda(resumen.montoInicial) }} + {{ formatearMoneda(resumen.totalEfectivo) }}</small>
      </div>
      <template v-if="resumen.efectivoContado !== null && resumen.efectivoContado !== undefined">
        <div class="card stat-card">
          <span class="stat-label">Efectivo contado</span>
          <span class="stat-value">{{ formatearMoneda(resumen.efectivoContado) }}</span>
        </div>
        <div class="card stat-card" :class="claseDiferencia">
          <span class="stat-label">Diferencia</span>
          <span class="stat-value">{{ formatearMoneda(resumen.diferencia) }}</span>
          <small>{{ textoDiferencia }}</small>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { formatearMoneda } from '@/utils/format';

const props = defineProps({
  resumen: { type: Object, required: true }
});

const claseDiferencia = computed(() => {
  if (props.resumen.diferencia < 0) {
    return 'faltante';
  }
  return props.resumen.diferencia > 0 ? 'sobrante' : 'cuadrada';
});

const textoDiferencia = computed(() => {
  const valor = Math.abs(props.resumen.diferencia || 0);
  if (props.resumen.diferencia < 0) {
    return `${formatearMoneda(valor)} faltantes`;
  }
  return props.resumen.diferencia > 0 ? `${formatearMoneda(valor)} sobrantes` : 'Caja cuadrada';
});
</script>

<style scoped>
.destacado {
  border-top: 4px solid var(--color-primary);
}

.faltante {
  border-top: 4px solid var(--color-danger);
}

.faltante .stat-value,
.faltante small {
  color: var(--color-danger);
}

.sobrante {
  border-top: 4px solid var(--color-warning);
}

.cuadrada {
  border-top: 4px solid var(--color-success);
}
</style>
