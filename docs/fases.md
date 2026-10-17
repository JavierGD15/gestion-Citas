# Plan de trabajo por fases — SIGCA

El proyecto se desarrolló de forma incremental. Cada fase corresponde a uno o más Pull Requests encadenados: cada rama parte de la anterior y su PR apunta a ella, de modo que cada PR muestra solo los cambios de su fase. Al integrarlos a `main` en orden, GitHub reasigna automáticamente la base del siguiente PR.

Convención de ramas: `feature/<numero>-<descripcion>`.

## Avance 1 — Configuración y estructura

| PR | Rama | Alcance | Estado |
| --- | --- | --- | --- |
| [#1](https://github.com/JavierGD15/gestion-Citas/pull/1) | `feature/01-arquetipos` | Arquetipos de backend y frontend, estructura de carpetas, configuración base, `.env.example`, health check | Completado |
| [#2](https://github.com/JavierGD15/gestion-Citas/pull/2) | `feature/02-modelos-base` | Modelos principales: usuarios, servicios, contenido institucional, horarios, mensajes de contacto y contadores | Completado |
| [#3](https://github.com/JavierGD15/gestion-Citas/pull/3) | `feature/03-autenticacion` | Login con JWT, `GET /api/auth/me`, hashing de contraseñas, autenticación y autorización por roles | Completado |
| [#4](https://github.com/JavierGD15/gestion-Citas/pull/4) | `feature/04-usuarios` | Administración de usuarios: CRUD, roles, activar/desactivar, restablecer contraseña | Completado |
| [#5](https://github.com/JavierGD15/gestion-Citas/pull/5) | `feature/05-servicios` | CRUD de servicios con precio, duración, imagen y estado | Completado |
| [#6](https://github.com/JavierGD15/gestion-Citas/pull/6) | `feature/06-portal-publico` | Portal público: inicio con carrusel, misión y visión, servicios, educativo, corporativo, horarios y contacto | Completado |

## Avance 2 — Gestión operativa

| PR | Rama | Alcance | Estado |
| --- | --- | --- | --- |
| [#7](https://github.com/JavierGD15/gestion-Citas/pull/7) | `feature/07-pacientes` | CRUD de pacientes, búsqueda, eliminación lógica y cálculo de edad | Completado |
| [#8](https://github.com/JavierGD15/gestion-Citas/pull/8) | `feature/08-responsables` | Responsables y asociación con uno o varios pacientes | Completado |
| [#9](https://github.com/JavierGD15/gestion-Citas/pull/9) | `feature/09-profesionales` | Gestión de profesionales vinculados a usuarios | Completado |
| [#10](https://github.com/JavierGD15/gestion-Citas/pull/10) | `feature/10-solicitudes-cita` | Solicitudes de cita desde el portal, consulta y rechazo | Completado |
| [#11](https://github.com/JavierGD15/gestion-Citas/pull/11) | `feature/11-citas` | Citas, reglas RN-01 a RN-14, disponibilidad y conversión de solicitudes | Completado |
| [#12](https://github.com/JavierGD15/gestion-Citas/pull/12) | `feature/12-calendario` | Calendario mensual de citas con detalle | Completado |
| [#13](https://github.com/JavierGD15/gestion-Citas/pull/13) | `feature/13-materiales` | Materiales y asignación a pacientes activos | Completado |
| [#14](https://github.com/JavierGD15/gestion-Citas/pull/14) | `feature/14-contenido-institucional` | Administración del contenido institucional, horarios y mensajes | Completado |

## Entrega final — Integración financiera

| PR | Rama | Alcance | Estado |
| --- | --- | --- | --- |
| [#15](https://github.com/JavierGD15/gestion-Citas/pull/15) | `feature/15-pagos` | Pagos completos y parciales, saldos, comprobantes, anulaciones, estado financiero y apertura de caja | Completado |
| [#16](https://github.com/JavierGD15/gestion-Citas/pull/16) | `feature/16-caja-diaria` | Totales por método, cierre, diferencias e historial de caja | Completado |
| [#17](https://github.com/JavierGD15/gestion-Citas/pull/17) | `feature/17-seguridad-validaciones` | Límites de solicitudes, protección contra inyección NoSQL, CORS y cabeceras de seguridad | Completado |
| [#18](https://github.com/JavierGD15/gestion-Citas/pull/18) | `feature/18-datos-prueba` | Script de datos ficticios con los mínimos requeridos | Completado |
| [#19](https://github.com/JavierGD15/gestion-Citas/pull/19) | `feature/19-documentacion` | README final, colección de Postman y evidencias | Completado |

La apertura de caja se incluyó en el PR 15 porque todo pago debe asociarse a una caja abierta (RN-20); el cierre y el historial se completan en el PR 16.

## Cobertura de la rúbrica

| Criterio | PR |
| --- | --- |
| Portal público y navegación | 06, 10 |
| Administración de contenido institucional | 14 |
| Autenticación, roles y seguridad | 03, 04, 17 |
| Gestión de pacientes y responsables | 07, 08 |
| Gestión de citas y calendario | 09, 11, 12 |
| Gestión de pagos y control financiero | 15, 16 |
| Gestión de materiales | 13 |
| Integración Vue.js, API REST y MongoDB | Todos |
| Validaciones y reglas de negocio | 11, 15, 16, 17 |
| Documentación y ejecución | 18, 19 |

## Distribución de responsabilidades

| Integrante | Área |
| --- | --- |
| Integrante 1 | Backend y base de datos: modelos, API REST, pacientes, responsables, servicios |
| Integrante 2 | Frontend e integración: Vue, Router, Pinia, portal público, formularios, calendario |
| Integrante 3 | Seguridad y gestión financiera: autenticación, roles, citas, pagos, caja diaria, validaciones |
