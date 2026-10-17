import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', {
  state: () => ({
    loading: false,
    sidebarOpen: false
  }),
  actions: {
    setLoading(value) {
      this.loading = value;
    },
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen;
    }
  }
});
