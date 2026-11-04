<template>
  <section v-if="pago">
    <div class="page-header no-print">
      <h1>Comprobante interno</h1>
      <div class="actions">
        <button type="button" class="btn btn-secondary" @click="router.back()">Volver</button>
        <button type="button" class="btn btn-primary" @click="imprimir">Imprimir</button>
      </div>
    </div>

    <article class="card comprobante" :class="{ anulado: pago.estado === 'ANULADO' }">
      <header>
        <div>
          <h2>{{ sitio.nombreCentro }}</h2>
          <p class="text-muted">{{ sitio.contacto.direccion }} {{ sitio.contacto.telefono ? `· Tel. ${sitio.contacto.telefono}` : '' }}</p>
        </div>
        <div class="numero">
          <span class="text-muted">Comprobante interno</span>
          <strong>{{ pago.comprobante }}</strong>
          <StatusBadge :estado="pago.estado" :etiquetas="ESTADOS_PAGO" />
        </div>
      </header>

      <dl class="detail-list">
        <dt>Fecha y hora</dt>
        <dd>{{ formatearFechaHora(pago.fechaPago) }}</dd>
        <dt>Paciente</dt>
        <dd>{{ pago.paciente?.nombres }} {{ pago.paciente?.apellidos }} ({{ pago.paciente?.codigo }})</dd>
        <dt>Cita</dt>
        <dd>
          {{ pago.cita?.codigo }} · {{ formatearFecha(pago.cita?.fecha) }} {{ pago.cita?.horaInicio }} – {{ pago.cita?.horaFin }}
        </dd>
        <dt>Servicio</dt>
        <dd>{{ pago.cita?.servicio?.nombre }}</dd>
        <dt>Profesional</dt>
        <dd>{{ pago.cita?.profesional?.nombreCompleto }}</dd>
        <dt>Método de pago</dt>
        <dd>{{ METODOS_PAGO[pago.metodo] }} <span v-if="pago.referencia">· Ref. {{ pago.referencia }}</span></dd>
        <dt>Caja</dt>
        <dd>{{ pago.caja?.codigo }}</dd>
        <dt>Registrado por</dt>
        <dd>{{ pago.registradoPor?.nombres }} {{ pago.registradoPor?.apellidos }}</dd>
        <template v-if="pago.observaciones">
          <dt>Observaciones</dt>
          <dd>{{ pago.observaciones }}</dd>
        </template>
        <template v-if="pago.estado === 'ANULADO'">
          <dt>Anulado por</dt>
          <dd>{{ pago.anuladoPor?.nombres }} {{ pago.anuladoPor?.apellidos }} · {{ formatearFechaHora(pago.fechaAnulacion) }}</dd>
          <dt>Motivo</dt>
          <dd>{{ pago.motivoAnulacion }}</dd>
        </template>
      </dl>

      <div class="totales">
        <div><span>Costo de la cita</span><strong>{{ formatearMoneda(pago.cita?.precioCentavos / 100) }}</strong></div>
        <div class="monto"><span>Monto de este pago</span><strong>{{ formatearMoneda(pago.monto) }}</strong></div>
        <div v-if="saldo"><span>Saldo pendiente actual</span><strong>{{ formatearMoneda(saldo.saldo) }}</strong></div>
      </div>
      <p class="text-muted nota">Documento interno de control administrativo. No constituye factura.</p>
    </article>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import StatusBadge from '@/components/common/StatusBadge.vue';
import pagosService from '@/services/pagos.service';
import { useNotificationsStore } from '@/stores/notifications';
import { useSitioStore } from '@/stores/sitio';
import { ESTADOS_PAGO, METODOS_PAGO } from '@/utils/catalogos';
import { mensajeError } from '@/utils/errors';
import { formatearFecha, formatearFechaHora, formatearMoneda } from '@/utils/format';

const route = useRoute();
const router = useRouter();
const sitio = useSitioStore();
const notifications = useNotificationsStore();

const pago = ref(null);
const saldo = ref(null);

function imprimir() {
  window.print();
}

onMounted(async () => {
  sitio.cargar().catch(() => {});
  try {
    pago.value = await pagosService.obtener(route.params.id);
    saldo.value = await pagosService.saldoCita(pago.value.cita._id);
  } catch (error) {
    notifications.error(mensajeError(error));
    router.replace({ name: 'admin-pagos' });
  }
});
</script>

<style scoped>
.comprobante {
  max-width: 720px;
  margin: 0 auto;
  position: relative;
}

.comprobante header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  border-bottom: 2px solid var(--color-primary);
  padding-bottom: 1rem;
  margin-bottom: 1rem;
}

.comprobante header h2 {
  margin: 0;
}

.numero {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.numero strong {
  font-size: 1.25rem;
}

.totales {
  margin-top: 1.5rem;
  border-top: 1px solid var(--color-border);
  padding-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.totales div {
  display: flex;
  justify-content: space-between;
}

.totales .monto strong {
  font-size: 1.35rem;
  color: var(--color-primary-dark);
}

.nota {
  margin-top: 1.5rem;
  font-size: 0.8rem;
  text-align: center;
}

.anulado::after {
  content: 'ANULADO';
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-20deg);
  font-size: 4rem;
  font-weight: 900;
  color: rgba(209, 73, 91, 0.18);
  pointer-events: none;
}

@media print {
  .no-print {
    display: none;
  }

  .comprobante {
    box-shadow: none;
    border: none;
  }
}
</style>
