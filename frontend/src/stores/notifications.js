import { defineStore } from 'pinia';

let siguienteId = 1;

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    items: []
  }),
  actions: {
    agregar(tipo, mensaje, duracion = 4500) {
      const id = siguienteId++;
      this.items.push({ id, tipo, mensaje });
      if (duracion > 0) {
        setTimeout(() => this.remover(id), duracion);
      }
    },
    exito(mensaje) {
      this.agregar('exito', mensaje);
    },
    error(mensaje) {
      this.agregar('error', mensaje, 7000);
    },
    info(mensaje) {
      this.agregar('info', mensaje);
    },
    remover(id) {
      this.items = this.items.filter((item) => item.id !== id);
    }
  }
});
