import { ROLES, TODOS_LOS_ROLES } from '@/utils/roles';

const { ADMINISTRADOR, RECEPCIONISTA, PROFESIONAL } = ROLES;

export default [
  { titulo: 'Panel', ruta: 'admin-dashboard', roles: TODOS_LOS_ROLES },
  { titulo: 'Calendario', ruta: 'admin-calendario', roles: TODOS_LOS_ROLES },
  { titulo: 'Citas', ruta: 'admin-citas', roles: TODOS_LOS_ROLES },
  { titulo: 'Solicitudes', ruta: 'admin-solicitudes', roles: [ADMINISTRADOR, RECEPCIONISTA] },
  { titulo: 'Pacientes', ruta: 'admin-pacientes', roles: TODOS_LOS_ROLES },
  { titulo: 'Responsables', ruta: 'admin-responsables', roles: [ADMINISTRADOR, RECEPCIONISTA] },
  { titulo: 'Materiales', ruta: 'admin-materiales', roles: [ADMINISTRADOR, PROFESIONAL] },
  { titulo: 'Profesionales', ruta: 'admin-profesionales', roles: [ADMINISTRADOR, RECEPCIONISTA] },
  { titulo: 'Servicios', ruta: 'admin-servicios', roles: [ADMINISTRADOR, RECEPCIONISTA] },
  { titulo: 'Contenido del portal', ruta: 'admin-contenido', roles: [ADMINISTRADOR] },
  { titulo: 'Mensajes', ruta: 'admin-mensajes', roles: [ADMINISTRADOR] },
  { titulo: 'Usuarios', ruta: 'admin-usuarios', roles: [ADMINISTRADOR] },
  { titulo: 'Mi cuenta', ruta: 'admin-cuenta', roles: TODOS_LOS_ROLES }
];
