import { defineStore } from 'pinia';
import cajasService from '@/services/cajas.service';

export const useCajaStore = defineStore('caja', {
  state: () => ({
    actual: null,
    cargada: false
  }),
  getters: {
    abierta: (state) => Boolean(state.actual)
  },
  actions: {
    async cargarActual() {
      try {
        this.actual = await cajasService.actual();
      } finally {
        this.cargada = true;
      }
      return this.actual;
    },
    async abrir(datos) {
      this.actual = await cajasService.abrir(datos);
      return this.actual;
    },
    limpiar() {
      this.actual = null;
      this.cargada = false;
    }
  }
});
