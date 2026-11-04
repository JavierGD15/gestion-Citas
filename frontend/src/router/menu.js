import { ROLES, TODOS_LOS_ROLES } from '@/utils/roles';

const { ADMINISTRADOR } = ROLES;

export default [
  { titulo: 'Panel', ruta: 'admin-dashboard', roles: TODOS_LOS_ROLES },
  { titulo: 'Usuarios', ruta: 'admin-usuarios', roles: [ADMINISTRADOR] },
  { titulo: 'Mi cuenta', ruta: 'admin-cuenta', roles: TODOS_LOS_ROLES }
];
