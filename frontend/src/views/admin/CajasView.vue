<template>
  <section>
    <div class="page-header">
      <h1>{{ esAdmin ? 'Cajas' : 'Mis cajas' }}</h1>
      <RouterLink :to="{ name: 'admin-caja' }" class="btn btn-primary">Caja actual</RouterLink>
    </div>

    <div class="card">
      <form class="toolbar" @submit.prevent="buscar">
        <FormField id="cj-desde" label="Apertura desde">
          <input id="cj-desde" v-model="filtros.desde" type="date" />
        </FormField>
        <FormField id="cj-hasta" label="Hasta">
          <input id="cj-hasta" v-model="filtros.hasta" type="date" />
        </FormField>
        <FormField id="cj-estado" label="Estado">
          <select id="cj-estado" v-model="filtros.estado">
            <option value="">Todas</option>
            <option value="ABIERTA">Abiertas</option>
            <option value="CERRADA">Cerradas</option>
          </select>
        </FormField>
        <FormField v-if="esAdmin" id="cj-usuario" label="Responsable">
          <select id="cj-usuario" v-model="filtros.usuario">
            <option value="">Todos</option>
            <option v-for="usuario in usuarios" :key="usuario._id" :value="usuario._id">{{ usuario.nombreCompleto }}</option>
          </select>
        </FormField>
        <button type="submit" class="btn btn-secondary">Filtrar</button>
      </form>

      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>Caja</th>
              <th>Responsable</th>
              <th>Apertura</th>
              <th>Cierre</th>
              <th class="text-right">Ingresos</th>
              <th class="text-right">Efectivo esperado</th>
              <th class="text-right">Contado</th>
              <th class="text-right">Diferencia</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item._id">
              <td><RouterLink :to="{ name: 'admin-caja-detalle', params: { id: item._id } }">{{ item.codigo }}</RouterLink></td>
              <td>{{ item.usuario?.nombres }} {{ item.usuario?.apellidos }}</td>
              <td>{{ formatearFechaHora(item.fechaApertura) }}</td>
              <td>{{ item.fechaCierre ? formatearFechaHora(item.fechaCierre) : '—' }}</td>
              <td class="text-right">{{ formatearMoneda(item.resumen.totalIngresos) }}</td>
              <td class="text-right">{{ formatearMoneda(item.resumen.efectivoEsperado) }}</td>
              <td class="text-right">{{ item.resumen.efectivoContado === null || item.resumen.efectivoContado === undefined ? '—' : formatearMoneda(item.resumen.efectivoContado) }}</td>
              <td class="text-right" :class="{ 'text-danger': item.resumen.diferencia < 0 }">
                {{ item.resumen.diferencia === null || item.resumen.diferencia === undefined ? '—' : formatearMoneda(item.resumen.diferencia) }}
              </td>
              <td><StatusBadge :estado="item.estado" /></td>
            </tr>
            <tr v-if="!cargando && items.length === 0">
              <td colspan="9" class="text-muted">No hay cajas registradas</td>
            </tr>
          </tbody>
        </table>
      </div>
      <PaginationBar :meta="meta" @change="cargar" />
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import FormField from '@/components/common/FormField.vue';
import PaginationBar from '@/components/common/PaginationBar.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { useListado } from '@/composables/useListado';
import cajasService from '@/services/cajas.service';
import usuariosService from '@/services/usuarios.service';
import { useAuthStore } from '@/stores/auth';
import { formatearFechaHora, formatearMoneda } from '@/utils/format';
import { ROLES } from '@/utils/roles';

const auth = useAuthStore();
const esAdmin = computed(() => auth.tieneRol(ROLES.ADMINISTRADOR));
const { items, meta, cargando, filtros, cargar, buscar } = useListado(cajasService.listar, { desde: '', hasta: '', estado: '', usuario: '' });
const usuarios = ref([]);

onMounted(async () => {
  cargar(1);
  if (esAdmin.value) {
    try {
      const [administradores, recepcionistas] = await Promise.all([
        usuariosService.listar({ rol: 'ADMINISTRADOR', limit: 100 }),
        usuariosService.listar({ rol: 'RECEPCIONISTA', limit: 100 })
      ]);
      usuarios.value = [...administradores.data, ...recepcionistas.data];
    } catch {
      usuarios.value = [];
    }
  }
});
</script>
