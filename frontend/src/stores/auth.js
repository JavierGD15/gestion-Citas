import { defineStore } from 'pinia';
import authService from '@/services/auth.service';

const TOKEN_KEY = 'sigca_token';

function leerToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: leerToken(),
    usuario: null,
    cargado: false
  }),
  getters: {
    autenticado: (state) => Boolean(state.token && state.usuario),
    rol: (state) => state.usuario?.rol || ''
  },
  actions: {
    async login(credenciales) {
      const { token, usuario } = await authService.login(credenciales);
      this.token = token;
      this.usuario = usuario;
      this.cargado = true;
      try {
        localStorage.setItem(TOKEN_KEY, token);
      } catch {
        this.token = token;
      }
    },
    async cargarSesion() {
      if (!this.token) {
        this.cargado = true;
        return;
      }
      try {
        this.usuario = await authService.me();
      } catch {
        this.limpiar();
      } finally {
        this.cargado = true;
      }
    },
    tieneRol(...roles) {
      return roles.includes(this.rol);
    },
    limpiar() {
      this.token = '';
      this.usuario = null;
      try {
        localStorage.removeItem(TOKEN_KEY);
      } catch {
        this.token = '';
      }
    }
  }
});
