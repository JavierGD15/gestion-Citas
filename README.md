# SIGCA — Sistema Integral de Gestión de Citas y Atención

Aplicación web Full Stack para administrar las operaciones de un centro de atención psicológica y estimulación auditiva verbal: portal público, pacientes, responsables, servicios, citas, calendario, materiales, pagos y caja diaria.

## Tecnologías

| Capa | Tecnologías |
| --- | --- |
| Frontend | Vue.js 3, Vite, Vue Router, Pinia, Axios |
| Backend | Node.js, Express |
| Base de datos | MongoDB, Mongoose |

## Estructura del repositorio

```
gestion-Citas/
├── backend/            API REST (Node.js + Express + MongoDB)
│   └── src/
│       ├── config/       Variables de entorno y conexión a MongoDB
│       ├── controllers/  Controladores por módulo
│       ├── middlewares/  Manejo de errores, autenticación y autorización
│       ├── models/       Esquemas de Mongoose
│       ├── routes/       Definición de endpoints por módulo
│       ├── seed/         Script de datos de prueba
│       ├── services/     Lógica de negocio
│       ├── utils/        Utilidades compartidas
│       └── validators/   Validación de entradas
├── frontend/           Portal público y sistema administrativo (Vue.js)
│   └── src/
│       ├── assets/       Estilos e imágenes
│       ├── components/   Componentes reutilizables (common, public, admin)
│       ├── composables/  Lógica reutilizable de composición
│       ├── layouts/      Layout público y layout administrativo
│       ├── router/       Configuración de Vue Router
│       ├── services/     Cliente HTTP y servicios de la API
│       ├── stores/       Stores de Pinia
│       ├── utils/        Utilidades (formato de moneda, fechas, etc.)
│       └── views/        Vistas públicas, administrativas y de autenticación
└── docs/
    ├── fases.md        Plan de trabajo por fases y PRs
    └── minutas/        Minutas de cada avance
```

## Requisitos

- Node.js 20 o superior
- npm 10 o superior
- MongoDB 6 o superior (local o MongoDB Atlas)

## Instalación y ejecución

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

La API queda disponible en `http://localhost:3000/api`. Verificación: `GET /api/health`.

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

El frontend queda disponible en `http://localhost:5173`.

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Descripción |
| --- | --- |
| `NODE_ENV` | Entorno de ejecución |
| `PORT` | Puerto de la API |
| `MONGODB_URI` | Cadena de conexión a MongoDB |
| `JWT_SECRET` | Clave para firmar los tokens JWT |
| `JWT_EXPIRES_IN` | Vigencia de los tokens |
| `CORS_ORIGIN` | Origen permitido para el frontend |

### Frontend (`frontend/.env`)

| Variable | Descripción |
| --- | --- |
| `VITE_API_URL` | URL base de la API REST |

## Plan de trabajo

El desarrollo se organiza por fases y Pull Requests. Ver [docs/fases.md](docs/fases.md) y las minutas en [docs/minutas](docs/minutas).
