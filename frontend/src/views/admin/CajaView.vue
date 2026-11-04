<template>
  <section>
    <div class="page-header">
      <h1>Caja diaria</h1>
      <RouterLink :to="{ name: 'admin-cajas' }" class="btn btn-secondary">Cierres anteriores</RouterLink>
    </div>

    <div v-if="!caja.cargada" class="card text-muted">Cargando...</div>

    <template v-else-if="!caja.abierta">
      <div v-if="ultimoCierre" class="card cierre-reciente">
        <div class="encabezado">
          <div>
            <h2>Caja {{ ultimoCierre.codigo }} cerrada</h2>
            <p class="text-muted">Cierre {{ formatearFechaHora(ultimoCierre.fechaCierre) }}</p>
          </div>
          <RouterLink :to="{ name: 'admin-caja-detalle', params: { id: ultimoCierre._id } }" class="btn btn-secondary">Ver detalle</RouterLink>
        </div>
        <ResumenCaja :resumen="ultimoCierre.resumen" />
      </div>

      <form class="card form-stack apertura" novalidate @submit.prevent="abrir">
        <h2>Abrir caja</h2>
        <p class="text-muted">Registre el efectivo inicial con el que comienza la jornada. Todos los pagos que registre se asociarán a esta caja.</p>
        <FormField id="cj-monto" label="Monto inicial en efectivo (Q)" :error="errores.montoInicial" required>
          <input id="cj-monto" v-model="form.montoInicial" type="number" min="0" step="0.01" />
        </FormField>
        <FormField id="cj-obs" label="Observaciones">
          <textarea id="cj-obs" v-model.trim="form.observaciones" rows="2" maxlength="500"></textarea>
        </FormField>
        <button type="submit" class="btn btn-primary" :disabled="procesando">Abrir caja</button>
      </form>
    </template>

    <template v-else>
      <div class="card encabezado">
        <div>
          <h2>{{ caja.actual.codigo }} <StatusBadge :estado="caja.actual.estado" /></h2>
          <p class="text-muted">
            Responsable: {{ caja.actual.usuario?.nombres }} {{ caja.actual.usuario?.apellidos }} · Apertura {{ formatearFechaHora(caja.actual.fechaApertura) }}
          </p>
        </div>
        <div class="actions">
          <button type="button" class="btn btn-secondary" @click="refrescar">Actualizar</button>
          <button type="button" class="btn btn-danger" @click="abrirCierre">Cerrar caja</button>
        </div>
      </div>
      <ResumenCaja :resumen="caja.actual.resumen" />
      <MovimientosCaja class="movimientos" :caja-id="caja.actual._id" :version="version" permite-anular @changed="refrescar" />
    </template>

    <BaseModal v-model="mostrarCierre" title="Cerrar caja" size="sm">
      <form id="form-cierre" class="form-stack" novalidate @submit.prevent="cerrar">
        <dl class="detail-list">
          <dt>Monto inicial</dt>
          <dd>{{ formatearMoneda(caja.actual?.resumen.montoInicial) }}</dd>
          <dt>Pagos en efectivo</dt>
          <dd>{{ formatearMoneda(caja.actual?.resumen.totalEfectivo) }}</dd>
          <dt>Efectivo esperado</dt>
          <dd><strong>{{ formatearMoneda(esperado) }}</strong></dd>
        </dl>
        <FormField id="cj-contado" label="Efectivo contado al cierre (Q)" :error="errores.efectivoContado" required>
          <input id="cj-contado" v-model="cierre.efectivoContado" type="number" min="0" step="0.01" />
        </FormField>
        <p v-if="diferencia !== null" class="alert" :class="diferencia < 0 ? 'alert-error' : diferencia > 0 ? 'alert-warning' : 'alert-info'">
          Diferencia: {{ formatearMoneda(diferencia) }}
          {{ diferencia < 0 ? `(${formatearMoneda(-diferencia)} faltantes)` : diferencia > 0 ? `(${formatearMoneda(diferencia)} sobrantes)` : '(caja cuadrada)' }}
        </p>
        <FormField id="cj-obs-cierre" label="Observaciones del cierre">
          <textarea id="cj-obs-cierre" v-model.trim="cierre.observaciones" rows="2" maxlength="500"></textarea>
        </FormField>
        <p class="text-muted">Una vez cerrada, la caja no podrá recibir nuevos pagos ni modificarse.</p>
      </form>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="mostrarCierre = false">Cancelar</button>
        <button type="submit" form="form-cierre" class="btn btn-danger" :disabled="procesando">Confirmar cierre</button>
      </template>
    </BaseModal>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import MovimientosCaja from '@/components/admin/MovimientosCaja.vue';
import ResumenCaja from '@/components/admin/ResumenCaja.vue';
import BaseModal from '@/components/common/BaseModal.vue';
import FormField from '@/components/common/FormField.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import cajasService from '@/services/cajas.service';
import { useCajaStore } from '@/stores/caja';
import { useNotificationsStore } from '@/stores/notifications';
import { mensajeError } from '@/utils/errors';
import { aMonto, formatearFechaHora, formatearMoneda } from '@/utils/format';
import { montoNoNegativo, requerido, validarFormulario } from '@/utils/validators';

const caja = useCajaStore();
const notifications = useNotificationsStore();

const form = reactive({ montoInicial: '', observaciones: '' });
const cierre = reactive({ efectivoContado: '', observaciones: '' });
const errores = ref({});
const procesando = ref(false);
const mostrarCierre = ref(false);
const ultimoCierre = ref(null);
const version = ref(0);

const esperado = computed(() => caja.actual?.resumen.efectivoEsperado || 0);
const diferencia = computed(() => {
  if (cierre.efectivoContado === '' || Number.isNaN(Number(cierre.efectivoContado))) {
    return null;
  }
  return Math.round((Number(cierre.efectivoContado) - esperado.value) * 100) / 100;
});

async function refrescar() {
  await caja.cargarActual().catch((error) => notifications.error(mensajeError(error)));
  version.value += 1;
}

async function abrir() {
  errores.value = validarFormulario(form, { montoInicial: [requerido, montoNoNegativo] });
  if (Object.keys(errores.value).length > 0) {
    return;
  }
  procesando.value = true;
  try {
    await caja.abrir({ montoInicial: aMonto(form.montoInicial), observaciones: form.observaciones });
    Object.assign(form, { montoInicial: '', observaciones: '' });
    ultimoCierre.value = null;
    notifications.exito('Caja abierta correctamente');
  } catch (error) {
    notifications.error(mensajeError(error));
  } finally {
    procesando.value = false;
  }
}

async function abrirCierre() {
  await refrescar();
  Object.assign(cierre, { efectivoContado: '', observaciones: '' });
  errores.value = {};
  mostrarCierre.value = true;
}

async function cerrar() {
  errores.value = validarFormulario(cierre, { efectivoContado: [requerido, montoNoNegativo] });
  if (Object.keys(errores.value).length > 0) {
    return;
  }
  procesando.value = true;
  try {
    ultimoCierre.value = await cajasService.cerrar(caja.actual._id, {
      efectivoContado: aMonto(cierre.efectivoContado),
      observaciones: cierre.observaciones
    });
    mostrarCierre.value = false;
    notifications.exito('Caja cerrada correctamente');
    await caja.cargarActual();
  } catch (error) {
    notifications.error(mensajeError(error));
  } finally {
    procesando.value = false;
  }
}

onMounted(refrescar);
</script>

<style scoped>
.apertura {
  max-width: 480px;
}

.cierre-reciente {
  margin-bottom: 1rem;
}

.encabezado {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.encabezado h2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}

.encabezado p {
  margin: 0.25rem 0 0;
}

.movimientos {
  margin-top: 1rem;
}
</style>
