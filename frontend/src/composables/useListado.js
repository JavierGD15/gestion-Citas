import { reactive, ref } from 'vue';
import { useNotificationsStore } from '@/stores/notifications';
import { mensajeError } from '@/utils/errors';

function limpiarFiltros(filtros) {
  return Object.fromEntries(Object.entries(filtros).filter(([, valor]) => valor !== '' && valor !== null && valor !== undefined));
}

export function useListado(fetcher, filtrosIniciales = {}) {
  const notifications = useNotificationsStore();
  const items = ref([]);
  const meta = ref(null);
  const cargando = ref(false);
  const filtros = reactive({ ...filtrosIniciales });

  async function cargar(page = meta.value?.page || 1) {
    cargando.value = true;
    try {
      const respuesta = await fetcher({ ...limpiarFiltros(filtros), page });
      items.value = respuesta.data;
      meta.value = respuesta.meta || null;
    } catch (error) {
      notifications.error(mensajeError(error, 'No fue posible cargar la información'));
    } finally {
      cargando.value = false;
    }
  }

  function buscar() {
    return cargar(1);
  }

  function reiniciar() {
    Object.assign(filtros, filtrosIniciales);
    return cargar(1);
  }

  return { items, meta, cargando, filtros, cargar, buscar, reiniciar };
}
