<template>
  <BaseModal :model-value="modelValue" title="Registrar pago" @update:model-value="$emit('update:modelValue', $event)">
    <div v-if="caja.cargada && !caja.abierta" class="alert alert-warning aviso">
      Debe abrir una caja antes de registrar pagos.
      <RouterLink :to="{ name: 'admin-caja' }" @click="$emit('update:modelValue', false)">Ir a caja diaria</RouterLink>
    </div>
    <p v-else-if="caja.actual" class="text-muted aviso">Caja abierta: {{ caja.actual.codigo }}</p>

    <form id="form-pago" class="form-stack" novalidate @submit.prevent="guardar">
      <template v-if="!citaInicial">
        <FormField id="pg-paciente" label="Paciente" required>
          <BuscadorSelector
            id="pg-paciente"
            v-model="paciente"
            :fetcher="(q) => buscarPacientes(q)"
            :detalle="(p) => p.codigo"
            placeholder="Buscar paciente por nombre o código"
          />
        </FormField>
        <FormField v-if="paciente" id="pg-cita" label="Cita con saldo pendiente" :error="errores.cita" required>
          <select id="pg-cita" v-model="citaId">
            <option value="">Seleccione</option>
            <option v-for="cita in citasConSaldo" :key="cita._id" :value="cita._id">
              {{ cita.codigo }} · {{ formatearFecha(cita.fecha) }} · {{ cita.servicio?.nombre }} · saldo {{ formatearMoneda(cita.finanzas.saldo) }}
            </option>
          </select>
          <small v-if="citasConSaldo.length === 0" class="text-muted">El paciente no tiene citas con saldo pendiente.</small>
        </FormField>
      </template>

      <div v-if="resumen" class="resumen">
        <div><span class="text-muted">Costo</span><strong>{{ formatearMoneda(resumen.precio) }}</strong></div>
        <div><span class="text-muted">Pagado</span><strong>{{ formatearMoneda(resumen.totalPagado) }}</strong></div>
        <div><span class="text-muted">Saldo</span><strong>{{ formatearMoneda(resumen.saldo) }}</strong></div>
      </div>

      <div class="form-grid">
        <FormField id="pg-monto" label="Monto (Q)" :error="errores.monto" required>
          <input id="pg-monto" v-model="form.monto" type="number" min="0.01" step="0.01" :max="resumen?.saldo" />
        </FormField>
        <FormField id="pg-metodo" label="Método de pago" :error="errores.metodo" required>
          <select id="pg-metodo" v-model="form.metodo">
            <option v-for="(etiqueta, valor) in METODOS_PAGO" :key="valor" :value="valor">{{ etiqueta }}</option>
          </select>
        </FormField>
      </div>
      <div v-if="resumen && resumen.saldo > 0" class="atajos">
        <button type="button" class="btn btn-secondary btn-sm" @click="form.monto = resumen.saldo.toFixed(2)">Pago completo</button>
        <button type="button" class="btn btn-secondary btn-sm" @click="form.monto = (resumen.saldo / 2).toFixed(2)">Mitad del saldo</button>
      </div>
      <FormField v-if="form.metodo !== 'EFECTIVO'" id="pg-referencia" label="Referencia o autorización" :error="errores.referencia">
        <input id="pg-referencia" v-model.trim="form.referencia" maxlength="60" />
      </FormField>
      <FormField id="pg-observaciones" label="Observaciones" :error="errores.observaciones">
        <textarea id="pg-observaciones" v-model.trim="form.observaciones" rows="2" maxlength="500"></textarea>
      </FormField>
    </form>
    <template #footer>
      <button type="button" class="btn btn-secondary" @click="$emit('update:modelValue', false)">Cancelar</button>
      <button type="submit" form="form-pago" class="btn btn-primary" :disabled="guardando || !caja.abierta">Registrar pago</button>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import BaseModal from '@/components/common/BaseModal.vue';
import BuscadorSelector from '@/components/common/BuscadorSelector.vue';
import FormField from '@/components/common/FormField.vue';
import citasService from '@/services/citas.service';
import { buscarPacientes } from '@/services/pacientes.service';
import pagosService from '@/services/pagos.service';
import { useCajaStore } from '@/stores/caja';
import { useNotificationsStore } from '@/stores/notifications';
import { METODOS_PAGO } from '@/utils/catalogos';
import { erroresPorCampo, mensajeError } from '@/utils/errors';
import { aMonto, formatearFecha, formatearMoneda } from '@/utils/format';
import { montoPositivo, requerido, validarFormulario } from '@/utils/validators';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  citaInicial: { type: Object, default: null }
});

const emit = defineEmits(['update:modelValue', 'saved']);
const caja = useCajaStore();
const notifications = useNotificationsStore();

const paciente = ref(null);
const citasPaciente = ref([]);
const citaId = ref('');
const form = reactive({ monto: '', metodo: 'EFECTIVO', referencia: '', observaciones: '' });
const errores = ref({});
const guardando = ref(false);

const citasConSaldo = computed(() => citasPaciente.value.filter((cita) => cita.estado !== 'CANCELADA' && cita.finanzas?.saldo > 0));
const citaSeleccionada = computed(() => props.citaInicial || citasPaciente.value.find((cita) => cita._id === citaId.value));
const resumen = computed(() => citaSeleccionada.value?.finanzas || null);

watch(paciente, async (valor) => {
  citaId.value = '';
  citasPaciente.value = valor ? await citasService.porPaciente(valor._id).catch(() => []) : [];
});

watch(
  () => props.modelValue,
  (abierto) => {
    if (!abierto) {
      return;
    }
    caja.cargarActual().catch(() => {});
    paciente.value = null;
    citaId.value = '';
    errores.value = {};
    Object.assign(form, { monto: props.citaInicial?.finanzas?.saldo?.toFixed(2) || '', metodo: 'EFECTIVO', referencia: '', observaciones: '' });
  }
);

watch(citaId, () => {
  if (resumen.value) {
    form.monto = resumen.value.saldo.toFixed(2);
  }
});

async function guardar() {
  const noExcede = (valor) => !resumen.value || Number(valor) <= resumen.value.saldo || `El monto no puede superar el saldo de ${formatearMoneda(resumen.value.saldo)}`;
  errores.value = validarFormulario({ ...form, cita: citaSeleccionada.value?._id }, {
    cita: [requerido],
    monto: [requerido, montoPositivo, noExcede],
    metodo: [requerido]
  });
  if (Object.keys(errores.value).length > 0) {
    if (errores.value.cita) {
      notifications.error('Seleccione la cita a la que corresponde el pago');
    }
    return;
  }

  guardando.value = true;
  try {
    const resultado = await pagosService.registrar({
      cita: citaSeleccionada.value._id,
      monto: aMonto(form.monto),
      metodo: form.metodo,
      referencia: form.referencia,
      observaciones: form.observaciones
    });
    notifications.exito(`Pago registrado. Comprobante ${resultado.pago.comprobante}`);
    caja.cargarActual().catch(() => {});
    emit('saved', resultado);
    emit('update:modelValue', false);
  } catch (error) {
    errores.value = erroresPorCampo(error);
    notifications.error(mensajeError(error));
  } finally {
    guardando.value = false;
  }
}
</script>

<style scoped>
.aviso {
  margin-bottom: 1rem;
}

.resumen {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: var(--radius-sm);
  background: var(--color-surface-alt);
}

.resumen div {
  display: flex;
  flex-direction: column;
}

.atajos {
  display: flex;
  gap: 0.5rem;
}
</style>
