# Minuta de avance — 17 de octubre de 2026

**Proyecto:** SIGCA — Sistema Integral de Gestión de Citas y Atención
**Fase:** Avance 1 — Configuración y estructura
**Pull Request:** PR 01 — Arquetipos de backend y frontend

## Participantes

| Nombre | Rol en el proyecto |
| --- | --- |
| Javier Alexander Girón Donis | |
| | |
| | |

## Agenda

1. Revisión del enunciado del proyecto final integrador.
2. Definición del plan de trabajo por fases y Pull Requests.
3. Creación de los arquetipos de backend y frontend.
4. Acuerdos y próximos pasos.

## Desarrollo

### 1. Revisión del enunciado

Se revisaron los requisitos funcionales (RF-01 a RF-13), las reglas de negocio (RN-01 a RN-30), las colecciones mínimas de MongoDB, los endpoints de la API REST y la rúbrica de evaluación.

### 2. Plan de trabajo

Se dividió el proyecto en 19 Pull Requests agrupados en las tres etapas establecidas: Avance 1, Avance 2 y Entrega final. El detalle se encuentra en `docs/fases.md`.

### 3. Arquetipos creados

**Backend** (`backend/`)

- Proyecto Node.js con módulos ES y Express.
- Dependencias base: express, mongoose, dotenv, cors, helmet, morgan y nodemon.
- Estructura de carpetas: `config`, `controllers`, `middlewares`, `models`, `routes`, `seed`, `services`, `utils`, `validators`.
- Configuración de variables de entorno y conexión a MongoDB.
- Middleware centralizado de errores y manejo de rutas no encontradas.
- Endpoint de verificación `GET /api/health`.
- Archivo `.env.example`.

**Frontend** (`frontend/`)

- Proyecto Vue 3 con Vite.
- Dependencias base: vue-router, pinia y axios.
- Estructura de carpetas: `assets`, `components` (common, public, admin), `composables`, `layouts`, `router`, `services`, `stores`, `utils`, `views` (public, admin, auth).
- Layout público y layout administrativo responsive.
- Rutas iniciales: inicio, login, panel administrativo y página 404.
- Cliente HTTP configurado con `VITE_API_URL`.
- Archivo `.env.example`.

**Repositorio**

- `.gitignore` que excluye `node_modules` y archivos `.env`.
- README con estructura, requisitos e instrucciones de ejecución.

## Acuerdos

1. Todo cambio se integra a `main` mediante Pull Request.
2. Las ramas siguen la convención `feature/<numero>-<descripcion>`.
3. No se suben archivos `.env` ni credenciales reales al repositorio.
4. Cada avance se documenta con una minuta en `docs/minutas/`.

## Próximos pasos

| Actividad | PR | Responsable |
| --- | --- | --- |
| Modelos principales en MongoDB | 02 | |
| Autenticación JWT y roles | 03 | |
| Administración de usuarios | 04 | |
| CRUD de servicios | 05 | |
| Portal público inicial | 06 | |
