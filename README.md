# SIGCA — Sistema Integral de Gestión de Citas y Atención

Aplicación web Full Stack para un centro de atención psicológica y estimulación auditiva verbal. Integra un **portal público** donde los visitantes consultan información institucional, servicios, contenido educativo y horarios, y envían solicitudes de cita o mensajes de contacto, con un **sistema administrativo privado** para gestionar usuarios, pacientes, responsables, profesionales, servicios, citas, calendario, materiales, pagos y caja diaria.

Toda la información se almacena en MongoDB y se consume a través de una API REST protegida con JWT y control de acceso por roles.

## Integrantes

| Nombre | Carné | Rol en el proyecto |
| --- | --- | --- |
| Javier Alexander Girón Donis | | |
| | | |
| | | |

## Tecnologías

| Capa | Tecnologías |
| --- | --- |
| Frontend | Vue.js 3, Vite, Vue Router, Pinia, Axios, FullCalendar |
| Backend | Node.js 20, Express 5, express-validator, jsonwebtoken, bcryptjs, helmet, cors, express-rate-limit |
| Base de datos | MongoDB, Mongoose |
| Pruebas de API | Postman |

## Arquitectura

```
┌──────────────────────────┐      HTTP/JSON       ┌──────────────────────────┐      Mongoose      ┌──────────┐
│ Frontend (Vue 3 + Vite)  │  ─────────────────▶  │ API REST (Express)       │  ───────────────▶  │ MongoDB  │
│ Vue Router · Pinia       │   Authorization:     │ rutas → validadores →    │                    │          │
│ Portal público           │   Bearer <JWT>       │ middlewares → controla-  │                    │          │
│ Sistema administrativo   │  ◀─────────────────  │ dores → servicios        │  ◀───────────────  │          │
└──────────────────────────┘                      └──────────────────────────┘                    └──────────┘
```

- **Rutas** (`backend/src/routes`): definen los endpoints por módulo y aplican `authenticate`, `authorize(...roles)` y `validate(reglas)`.
- **Validadores** (`backend/src/validators`): reglas de express-validator para cada operación.
- **Controladores** (`backend/src/controllers`): reciben la solicitud y devuelven la respuesta JSON.
- **Servicios** (`backend/src/services`): contienen la lógica de negocio y las reglas RN-01 a RN-30.
- **Modelos** (`backend/src/models`): esquemas de Mongoose con referencias entre colecciones y `populate()`.
- **Frontend**: layouts público y administrativo, vistas por módulo, componentes reutilizables, stores de Pinia (`auth`, `caja`, `sitio`, `notifications`, `ui`) y servicios Axios por recurso.

## Estructura del repositorio

```
gestion-Citas/
├── backend/
│   ├── .env.example
│   └── src/
│       ├── config/        Variables de entorno y conexión a MongoDB
│       ├── constants/     Roles, estados y catálogos del dominio
│       ├── controllers/   Controladores por módulo
│       ├── middlewares/   Autenticación, autorización, validación, límites, saneamiento y errores
│       ├── models/        Esquemas de Mongoose
│       ├── routes/        Endpoints por módulo
│       ├── seed/          Datos de prueba y creación del administrador inicial
│       ├── services/      Lógica de negocio y cálculos financieros
│       ├── utils/         Montos en centavos, fechas, paginación y respuestas
│       └── validators/    Reglas de validación de entradas
├── frontend/
│   ├── .env.example
│   └── src/
│       ├── assets/        Estilos globales
│       ├── components/    Componentes comunes, del portal y administrativos
│       ├── composables/   Lógica reutilizable (listados con filtros y paginación)
│       ├── layouts/       Layout público y administrativo
│       ├── router/        Rutas, guardas y menú por rol
│       ├── services/      Clientes de la API por módulo
│       ├── stores/        Stores de Pinia
│       ├── utils/         Formatos, catálogos, roles y validaciones
│       └── views/         Vistas públicas, de autenticación y administrativas
└── docs/
    ├── evidencias/        Capturas de pantalla
    ├── fases.md           Plan de trabajo por fases y Pull Requests
    ├── minutas/           Minuta del avance 1
    └── postman/           Colección de Postman
```

## Requisitos de instalación

- Node.js 20 o superior y npm 10 o superior
- MongoDB 6 o superior, local o en MongoDB Atlas
- Git

## Configuración de MongoDB

**Opción 1: MongoDB local.** Instale MongoDB Community Server y verifique que el servicio esté activo en `mongodb://127.0.0.1:27017`. La base `sigca` se crea automáticamente.

**Opción 2: Docker.**

```bash
docker run -d --name sigca-mongo -p 27017:27017 mongo:7
```

**Opción 3: MongoDB Atlas.** Cree un clúster gratuito, un usuario de base de datos y permita su IP. Copie la cadena de conexión en `MONGODB_URI`, por ejemplo `mongodb+srv://usuario:clave@cluster.mongodb.net/sigca`.

## Variables de entorno

Copie los archivos de ejemplo y ajuste los valores. Los archivos `.env` no se suben al repositorio.

### Backend (`backend/.env`)

| Variable | Descripción | Ejemplo |
| --- | --- | --- |
| `NODE_ENV` | Entorno de ejecución | `development` |
| `PORT` | Puerto de la API | `3000` |
| `MONGODB_URI` | Cadena de conexión a MongoDB | `mongodb://127.0.0.1:27017/sigca` |
| `JWT_SECRET` | Clave para firmar los tokens (mínimo 32 caracteres en producción) | valor aleatorio |
| `JWT_EXPIRES_IN` | Vigencia del token | `8h` |
| `CORS_ORIGIN` | Orígenes permitidos, separados por comas | `http://localhost:5173` |
| `TZ_OFFSET` | Desfase horario para fechas de citas | `-06:00` |
| `ADMIN_CORREO` | Correo del administrador inicial (`npm run crear-admin`) | `admin@sigca.local` |
| `ADMIN_PASSWORD` | Contraseña del administrador inicial | `Admin12345` |

Para generar un `JWT_SECRET` seguro:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### Frontend (`frontend/.env`)

| Variable | Descripción | Ejemplo |
| --- | --- | --- |
| `VITE_API_URL` | URL base de la API | `http://localhost:3000/api` |

## Comandos de ejecución

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

La API queda en `http://localhost:3000/api`. Puede verificarla con `GET /api/health`.

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia la API con recarga automática (nodemon) |
| `npm start` | Inicia la API en modo normal |
| `npm run seed` | Elimina la base configurada y carga los datos de prueba |
| `npm run crear-admin` | Crea solo el administrador inicial definido en `.env` |

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

El sistema queda en `http://localhost:5173`. El portal público está en `/` y el sistema administrativo en `/login`.

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo de Vite |
| `npm run build` | Compilación para producción en `dist/` |
| `npm run preview` | Sirve la compilación de producción |

## Datos de prueba

`npm run seed` carga datos ficticios con fechas calculadas a partir del día de ejecución:

| Colección | Cantidad |
| --- | --- |
| Usuarios | 1 administrador, 2 recepcionistas, 3 profesionales |
| Pacientes | 10 (5 menores de edad con responsable, 1 inactivo) |
| Responsables | 5 |
| Servicios | 5 |
| Citas | 15 (completadas, cancelada, confirmadas y pendientes) |
| Solicitudes de cita | 5 (pendientes, atendida y rechazada) |
| Materiales | 5, con 6 asignaciones |
| Pagos | 10 (completos, parciales y anulados con los tres métodos) |
| Cajas | 3 (dos cerradas, una de ellas con diferencia de −Q10, y una abierta) |
| Contenido institucional | Información principal, logotipo, carrusel de 5 imágenes, misión, visión, contacto, publicaciones y actividades |
| Horarios | Lunes a viernes 08:00–17:00, sábado 08:00–12:00 |

Escenarios listos para demostrar:

- **Pago completo:** CIT-000001, CIT-000003, CIT-000005, CIT-000008, CIT-000010
- **Pago parcial con saldo:** CIT-000002, CIT-000006 (incluye un abono anulado), CIT-000009
- **Saldo pendiente sin pagos:** CIT-000007, CIT-000011, CIT-000012, CIT-000014, CIT-000015
- **Pago anulado:** CIT-000013
- **Cierres de caja:** CAJ-00001 (faltante de Q10) y CAJ-00002 (cuadrada). CAJ-00003 queda abierta para la recepcionista 1.

## Credenciales de demostración

| Rol | Correo | Contraseña |
| --- | --- | --- |
| ADMINISTRADOR | admin@sigca.local | Admin12345 |
| RECEPCIONISTA | recepcion1@sigca.local | Recep12345 |
| RECEPCIONISTA | recepcion2@sigca.local | Recep12345 |
| PROFESIONAL | laura.mendez@sigca.local | Prof12345 |
| PROFESIONAL | diego.herrera@sigca.local | Prof12345 |
| PROFESIONAL | sofia.castro@sigca.local | Prof12345 |

Son credenciales ficticias exclusivas para el entorno local de demostración.

## Roles y permisos

| Módulo | Administrador | Recepcionista | Profesional |
| --- | :---: | :---: | :---: |
| Usuarios | ✔ | | |
| Contenido institucional, horarios y mensajes | ✔ | | |
| Servicios | ✔ | Consulta | |
| Profesionales | ✔ | Consulta | Perfil propio |
| Pacientes y responsables | ✔ | ✔ | Información básica de sus pacientes |
| Solicitudes de cita | ✔ | ✔ | |
| Citas: programar, confirmar, reprogramar, cancelar | ✔ | ✔ | |
| Citas: consultar y completar | ✔ | ✔ | Solo las asignadas |
| Calendario | ✔ | ✔ | Solo sus citas |
| Materiales: administrar | ✔ | | |
| Materiales: consultar y asignar | ✔ | | A sus pacientes |
| Pagos y saldos | ✔ | ✔ | |
| Caja diaria | Todas las cajas | Solo las propias | |

Los permisos se verifican en el backend con el middleware `authorize`. El frontend oculta las opciones no permitidas, pero la autorización real ocurre en la API.

## API REST

Todas las respuestas son JSON con el formato `{ ok, data, message, meta }` en caso de éxito y `{ ok: false, message, details }` en caso de error.

| Módulo | Endpoints principales |
| --- | --- |
| Autenticación | `POST /api/auth/login`, `GET /api/auth/me`, `PUT /api/auth/password` |
| Usuarios | `GET/POST /api/usuarios`, `GET/PUT /api/usuarios/:id`, `PATCH /api/usuarios/:id/estado`, `PATCH /api/usuarios/:id/password` |
| Pacientes | `GET/POST /api/pacientes`, `GET/PUT /api/pacientes/:id`, `PATCH /api/pacientes/:id/estado`, `GET /api/pacientes/:id/{responsables,citas,pagos,materiales}` |
| Responsables | `GET/POST /api/responsables`, `GET/PUT /api/responsables/:id`, `POST /api/responsables/:id/pacientes`, `DELETE /api/responsables/:id/pacientes/:pacienteId` |
| Profesionales | `GET/POST /api/profesionales`, `GET /api/profesionales/me`, `GET/PUT /api/profesionales/:id`, `PATCH /api/profesionales/:id/estado` |
| Servicios | `GET/POST /api/servicios`, `GET/PUT /api/servicios/:id`, `PATCH /api/servicios/:id/estado` |
| Solicitudes | `POST/GET /api/solicitudes-cita`, `GET /api/solicitudes-cita/:id`, `POST /api/solicitudes-cita/:id/convertir`, `PATCH /api/solicitudes-cita/:id/rechazar` |
| Citas | `GET/POST /api/citas`, `GET /api/citas/calendario`, `GET /api/citas/disponibilidad`, `GET/PUT /api/citas/:id`, `PATCH /api/citas/:id/estado`, `GET /api/citas/:id/pagos`, `GET /api/citas/:id/saldo` |
| Materiales | `GET/POST /api/materiales`, `GET/PUT /api/materiales/:id`, `PATCH /api/materiales/:id/estado`, `GET/POST /api/materiales/:id/asignaciones`, `PATCH /api/materiales/asignaciones/:id/retirar` |
| Pagos | `GET/POST /api/pagos`, `GET /api/pagos/:id`, `GET /api/pagos/comprobante/:numero`, `GET /api/pagos/saldos-pendientes`, `PATCH /api/pagos/:id/anular` |
| Caja | `POST /api/cajas/abrir`, `GET /api/cajas/actual`, `GET /api/cajas`, `GET /api/cajas/:id`, `GET /api/cajas/:id/movimientos`, `POST /api/cajas/:id/cerrar` |
| Contenido | `GET /api/contenido`, `GET /api/contenido/publico`, `GET /api/contenido/admin`, `POST /api/contenido`, `PUT /api/contenido/:id`, `PATCH /api/contenido/:id/estado` |
| Horarios | `GET /api/horarios`, `PUT /api/horarios` |
| Contacto | `POST /api/contacto`, `GET /api/contacto`, `PATCH /api/contacto/:id/leido` |

### Códigos HTTP

| Código | Uso |
| --- | --- |
| 200 / 201 | Consulta o creación exitosa |
| 400 | Datos inválidos o campos no permitidos |
| 401 | Sin autenticación, token inválido o usuario inactivo |
| 403 | El rol no tiene permiso para la operación |
| 404 | Recurso inexistente |
| 409 | Conflicto: horario ocupado, registro duplicado, caja ya abierta o cambio concurrente |
| 413 | Cuerpo de la solicitud demasiado grande |
| 422 | Regla de negocio incumplida |
| 429 | Demasiadas solicitudes |

## Colecciones de MongoDB

`usuarios`, `profesionales`, `pacientes`, `responsables`, `servicios`, `citas`, `solicitudesCita`, `materiales`, `asignacionesMateriales`, `contenidoInstitucional`, `horarios`, `mensajesContacto`, `pagos`, `cajas` y `contadores`.

Relaciones principales:

- `citas` referencia a `pacientes`, `servicios`, `profesionales` y `solicitudesCita`.
- `pagos` referencia a `citas`, `pacientes`, `cajas` y `usuarios`.
- `cajas` referencia al `usuario` responsable.
- `responsables` referencia a uno o varios `pacientes`.
- `profesionales` referencia a su `usuario`.
- `asignacionesMateriales` referencia a `materiales` y `pacientes`.

## Reglas de negocio y cálculos financieros

- Los montos se almacenan en **centavos enteros** (RN-28) y se exponen en quetzales.
- El precio y la duración del servicio se **copian a la cita** al programarla; los cambios posteriores del servicio no afectan citas existentes.
- El **saldo** y el **estado financiero** (PENDIENTE, PARCIAL, PAGADO) se calculan por agregación de los pagos con estado REGISTRADO; los pagos anulados no cuentan (RN-18, RN-19).
- Para evitar pagos simultáneos que superen el costo (RN-17), el registro de un pago realiza una reserva atómica sobre la cita.
- En el **cierre de caja**: efectivo esperado = monto inicial + pagos en efectivo; diferencia = efectivo contado − efectivo esperado (RN-23).
- Solo existe una caja abierta por usuario, garantizada con un índice único parcial (RN-22).
- Los pagos no se eliminan físicamente (RN-26); solo se anulan con justificación mientras su caja está abierta.
- Una cita con pagos válidos no puede cancelarse (RN-27).
- Las citas validan traslapes por profesional y por paciente, horario de atención, fechas pasadas, entidades activas y responsables de menores (RN-01 a RN-14).

## Seguridad

- Contraseñas con bcrypt (12 rondas); nunca se devuelven en la API.
- JWT HS256 con algoritmo fijado al verificar y expiración configurable; los usuarios inactivos pierden el acceso inmediatamente.
- Autorización por rol en cada endpoint privado.
- Validación de todas las entradas con express-validator, y rechazo de operadores de MongoDB (`$`), claves con punto, `__proto__`, `constructor` y parámetros de consulta repetidos.
- Límite de intentos de inicio de sesión y de envíos de formularios públicos.
- Helmet, CORS con lista de orígenes y límite de 100 KB para el cuerpo de las solicitudes.
- Manejo centralizado de errores, sin detalles internos en producción.
- Variables sensibles en `.env`, excluido del repositorio.

## Colección de Postman

Importe [`docs/postman/SIGCA.postman_collection.json`](docs/postman/SIGCA.postman_collection.json) en Postman. Con los datos de prueba cargados y la API en ejecución, ejecute las carpetas en orden: el login guarda los tokens y cada solicitud guarda los identificadores que usan las siguientes. Incluye el flujo completo de pagos y caja, y las pruebas de permisos.

La colección también se puede ejecutar desde la terminal:

```bash
npx newman run docs/postman/SIGCA.postman_collection.json
```

## Evidencias

| Portal público | |
| --- | --- |
| ![Inicio](docs/evidencias/01-portal-inicio.jpg) | ![Servicios](docs/evidencias/02-portal-servicios.jpg) |
| ![Corporativo](docs/evidencias/03-portal-corporativo.jpg) | ![Solicitar cita](docs/evidencias/04-portal-solicitar-cita.jpg) |
| ![Contacto](docs/evidencias/05-portal-contacto.jpg) | ![Vista móvil](docs/evidencias/06-portal-movil.jpg) |

| Sistema administrativo | |
| --- | --- |
| ![Login](docs/evidencias/07-login.jpg) | ![Panel](docs/evidencias/08-panel-recepcion.jpg) |
| ![Pacientes](docs/evidencias/09-pacientes.jpg) | ![Responsables del paciente](docs/evidencias/10-paciente-responsables.jpg) |
| ![Calendario](docs/evidencias/11-calendario.jpg) | ![Pagos de la cita](docs/evidencias/12-cita-pagos.jpg) |
| ![Pagos](docs/evidencias/13-pagos.jpg) | ![Comprobante](docs/evidencias/14-comprobante.jpg) |
| ![Caja diaria](docs/evidencias/15-caja-diaria.jpg) | ![Cierres de caja](docs/evidencias/16-cierres-caja.jpg) |
| ![Contenido institucional](docs/evidencias/17-contenido-carrusel.jpg) | ![Usuarios](docs/evidencias/18-usuarios.jpg) |

## Distribución de responsabilidades

| Integrante | Área | Módulos |
| --- | --- | --- |
| Integrante 1 | Backend y base de datos | Modelos de MongoDB, API REST, pacientes, responsables, profesionales y servicios |
| Integrante 2 | Frontend e integración | Vue.js, Vue Router, Pinia, portal público, formularios, calendario e integración con la API |
| Integrante 3 | Seguridad y gestión financiera | Autenticación, roles, citas, pagos, caja diaria y validaciones |

El desarrollo se realizó por fases mediante Pull Requests. El detalle está en [docs/fases.md](docs/fases.md).
