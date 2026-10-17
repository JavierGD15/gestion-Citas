# Plan de trabajo por fases — SIGCA

El proyecto se desarrolla de forma incremental. Cada fase corresponde a uno o más Pull Requests hacia `main`, y cada avance se documenta con una minuta en `docs/minutas/`.

Convención de ramas: `feature/<numero>-<descripcion>`.

## Avance 1 — Configuración y estructura

| PR | Rama | Alcance | Estado |
| --- | --- | --- | --- |
| 01 | `feature/01-arquetipos` | Arquetipos de backend y frontend, estructura de carpetas, configuración base, `.env.example`, health check | En revisión |
| 02 | `feature/02-modelos-base` | Conexión MongoDB y modelos principales: usuarios, servicios, contenido institucional, horarios, mensajes de contacto | Pendiente |
| 03 | `feature/03-autenticacion` | Login con JWT, `GET /api/auth/me`, hashing de contraseñas, middleware de autenticación y autorización por roles | Pendiente |
| 04 | `feature/04-usuarios` | Administración de usuarios: CRUD, asignación de roles, activar/desactivar, restablecer contraseña | Pendiente |
| 05 | `feature/05-servicios` | CRUD de servicios con precio, duración, imagen y estado | Pendiente |
| 06 | `feature/06-portal-publico` | Portal público inicial: inicio, carrusel, misión y visión, servicios, horarios, contacto | Pendiente |

## Avance 2 — Gestión operativa

| PR | Rama | Alcance | Estado |
| --- | --- | --- | --- |
| 07 | `feature/07-pacientes` | CRUD de pacientes, búsqueda, eliminación lógica, cálculo de edad | Pendiente |
| 08 | `feature/08-responsables` | Responsables y asociación con uno o varios pacientes | Pendiente |
| 09 | `feature/09-profesionales` | Gestión de profesionales | Pendiente |
| 10 | `feature/10-solicitudes-cita` | Solicitudes de cita desde el portal y conversión a cita | Pendiente |
| 11 | `feature/11-citas` | Programación, confirmación, reprogramación, cancelación y reglas RN-01 a RN-14 | Pendiente |
| 12 | `feature/12-calendario` | Calendario mensual de citas con detalle | Pendiente |
| 13 | `feature/13-materiales` | Materiales y asignación a pacientes activos | Pendiente |
| 14 | `feature/14-contenido-institucional` | Administración del contenido institucional del portal | Pendiente |

## Entrega final — Integración financiera

| PR | Rama | Alcance | Estado |
| --- | --- | --- | --- |
| 15 | `feature/15-pagos` | Pagos completos y parciales, saldos, comprobantes, anulaciones, estado financiero | Pendiente |
| 16 | `feature/16-caja-diaria` | Apertura, movimientos, totales por método, cierre y diferencias de caja | Pendiente |
| 17 | `feature/17-seguridad-validaciones` | Validaciones de entrada, rate limiting, revisión OWASP, códigos HTTP | Pendiente |
| 18 | `feature/18-datos-prueba` | Script de datos ficticios con los mínimos requeridos | Pendiente |
| 19 | `feature/19-documentacion` | README final, colección Postman, evidencias y credenciales de demostración | Pendiente |

## Distribución de responsabilidades

| Integrante | Área |
| --- | --- |
| Integrante 1 | Backend y base de datos: modelos, API REST, pacientes, responsables, servicios |
| Integrante 2 | Frontend e integración: Vue, Router, Pinia, portal público, formularios, calendario |
| Integrante 3 | Seguridad y gestión financiera: autenticación, roles, citas, pagos, caja diaria, validaciones |
