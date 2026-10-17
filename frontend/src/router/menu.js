import { ROLES, TODOS_LOS_ROLES } from '@/utils/roles';

const { ADMINISTRADOR, RECEPCIONISTA } = ROLES;

export default [
  { titulo: 'Panel', ruta: 'admin-dashboard', roles: TODOS_LOS_ROLES },
  { titulo: 'Pacientes', ruta: 'admin-pacientes', roles: [ADMINISTRADOR, RECEPCIONISTA] },
  { titulo: 'Responsables', ruta: 'admin-responsables', roles: [ADMINISTRADOR, RECEPCIONISTA] },
  { titulo: 'Servicios', ruta: 'admin-servicios', roles: [ADMINISTRADOR, RECEPCIONISTA] },
  { titulo: 'Usuarios', ruta: 'admin-usuarios', roles: [ADMINISTRADOR] },
  { titulo: 'Mi cuenta', ruta: 'admin-cuenta', roles: TODOS_LOS_ROLES }
];
