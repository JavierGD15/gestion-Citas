import { createRouter, createWebHistory } from 'vue-router';
import PublicLayout from '@/layouts/PublicLayout.vue';
import AdminLayout from '@/layouts/AdminLayout.vue';
import { useAuthStore } from '@/stores/auth';
import { ROLES, TODOS_LOS_ROLES } from '@/utils/roles';

const { ADMINISTRADOR, RECEPCIONISTA } = ROLES;

const routes = [
  {
    path: '/',
    component: PublicLayout,
    children: [
      { path: '', name: 'inicio', component: () => import('@/views/public/HomeView.vue') }
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue')
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'admin-dashboard', component: () => import('@/views/admin/DashboardView.vue'), meta: { roles: TODOS_LOS_ROLES } },
      { path: 'cuenta', name: 'admin-cuenta', component: () => import('@/views/admin/CuentaView.vue'), meta: { roles: TODOS_LOS_ROLES } },
      { path: 'servicios', name: 'admin-servicios', component: () => import('@/views/admin/ServiciosView.vue'), meta: { roles: [ADMINISTRADOR, RECEPCIONISTA] } },
      { path: 'usuarios', name: 'admin-usuarios', component: () => import('@/views/admin/UsuariosView.vue'), meta: { roles: [ADMINISTRADOR] } }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'no-encontrado',
    component: () => import('@/views/NotFoundView.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();

  if (!auth.cargado) {
    await auth.cargarSesion();
  }

  if (to.meta.requiresAuth && !auth.autenticado) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  if (to.meta.roles && !auth.tieneRol(...to.meta.roles)) {
    return { name: 'admin-dashboard' };
  }

  if (to.name === 'login' && auth.autenticado) {
    return { name: 'admin-dashboard' };
  }

  return true;
});

export default router;
