<template>
  <section>
    <div class="page-header">
      <h1>Caja diaria</h1>
    </div>

    <div v-if="!caja.cargada" class="card text-muted">Cargando...</div>

    <form v-else-if="!caja.abierta" class="card form-stack apertura" novalidate @submit.prevent="abrir">
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

    <template v-else>
      <div class="card encabezado">
        <div>
          <h2>{{ caja.actual.codigo }} <StatusBadge :estado="caja.actual.estado" /></h2>
          <p class="text-muted">
            Responsable: {{ caja.actual.usuario?.nombres }} {{ caja.actual.usuario?.apellidos }} · Apertura {{ formatearFechaHora(caja.actual.fechaApertura) }}
          </p>
        </div>
      </div>
      <ResumenCaja :resumen="caja.actual.resumen" />
    </template>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import ResumenCaja from '@/components/admin/ResumenCaja.vue';
import FormField from '@/components/common/FormField.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { useCajaStore } from '@/stores/caja';
import { useNotificationsStore } from '@/stores/notifications';
import { mensajeError } from '@/utils/errors';
import { aMonto, formatearFechaHora } from '@/utils/format';
import { montoNoNegativo, requerido, validarFormulario } from '@/utils/validators';

const caja = useCajaStore();
const notifications = useNotificationsStore();

const form = reactive({ montoInicial: '', observaciones: '' });
const errores = ref({});
const procesando = ref(false);

async function abrir() {
  errores.value = validarFormulario(form, { montoInicial: [requerido, montoNoNegativo] });
  if (Object.keys(errores.value).length > 0) {
    return;
  }
  procesando.value = true;
  try {
    await caja.abrir({ montoInicial: aMonto(form.montoInicial), observaciones: form.observaciones });
    notifications.exito('Caja abierta correctamente');
  } catch (error) {
    notifications.error(mensajeError(error));
  } finally {
    procesando.value = false;
  }
}

onMounted(() => caja.cargarActual().catch((error) => notifications.error(mensajeError(error))));
</script>

<style scoped>
.apertura {
  max-width: 480px;
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
</style>
