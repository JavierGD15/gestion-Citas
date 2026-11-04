import { defineStore } from 'pinia';
import portalService from '@/services/portal.service';

export const useSitioStore = defineStore('sitio', {
  state: () => ({
    contenido: null,
    horarios: [],
    cargado: false,
    cargando: false
  }),
  getters: {
    general: (state) => state.contenido?.general?.datos || {},
    nombreCentro() {
      return this.general.nombreCentro || 'SIGCA';
    },
    logo() {
      return this.general.logo || '';
    },
    contacto: (state) => state.contenido?.contacto?.datos || {},
    horariosActivos: (state) => state.horarios.filter((horario) => horario.activo)
  },
  actions: {
    async cargar(forzar = false) {
      if ((this.cargado && !forzar) || this.cargando) {
        return;
      }
      this.cargando = true;
      try {
        const [contenido, horarios] = await Promise.all([portalService.contenido(), portalService.horarios()]);
        this.contenido = contenido;
        this.horarios = horarios;
        this.cargado = true;
        document.title = this.nombreCentro;
      } finally {
        this.cargando = false;
      }
    }
  }
});
