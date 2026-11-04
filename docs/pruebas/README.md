# Pruebas funcionales de SIGCA

Pruebas manuales de extremo a extremo realizadas en el navegador sobre el sistema en ejecución local, con los datos de `npm run seed`.

- **Fecha de ejecución:** 3 de noviembre de 2026
- **Entorno:** MongoDB 7 local (`mongodb://127.0.0.1:27017/sigca`), API en `http://localhost:3000/api`, frontend en `http://localhost:5173`
- **Resultado general:** todas las funcionalidades probadas funcionan. Las fallas encontradas durante las pruebas se corrigieron y se volvieron a probar (ver [Fallas encontradas y corregidas](#fallas-encontradas-y-corregidas)).
- **Pruebas de API:** la colección de Postman (`docs/postman`) pasa completa: 78 solicitudes y 81 aserciones sin fallos.
- **Registros en MongoDB:** consulta directa a la base después de las pruebas en [registros-mongodb.txt](registros-mongodb.txt).

Las capturas están en esta misma carpeta y se nombran por número de prueba.

## 1. Portal público (RF-01)

| # | Prueba | Resultado | Evidencia |
| --- | --- | --- | --- |
| 01 | Inicio con logotipo, nombre del centro, menú y carrusel de 5 imágenes | ✅ | [01](01-portal-inicio-carrusel.jpg) |
| 02 | Accesos a las secciones principales, servicios destacados, misión y visión | ✅ | [02](02-portal-inicio-secciones.jpg) |
| 03 | Pie de página con contacto y horarios desde MongoDB | ✅ | [03](03-portal-pie-de-pagina.jpg) |
| 04 | Misión y visión | ✅ | [04](04-portal-mision-vision.jpg) |
| 05 | Servicios activos con imagen, descripción, duración y botón "Solicitar cita" | ✅ | [05](05-portal-servicios.jpg) |
| 06 | Contenido educativo con fecha de publicación, imagen y enlace opcional | ✅ | [06](06-portal-educativo.jpg) |
| 07 | Corporativo: capacitaciones, escuela para padres e imágenes | ✅ | [07](07-portal-corporativo.jpg) |
| 08 | Horarios de atención configurables | ✅ | [08](08-portal-horarios.jpg) |
| 09 | Contacto: validación de campos obligatorios | ✅ | [09](09-portal-contacto-validacion.jpg) |
| 10 | Contacto: envío correcto (queda guardado en MongoDB, ver prueba 99) | ✅ | [10](10-portal-contacto-enviado.jpg) |
| 11 | Solicitud de cita: formulario con servicio y fecha preferida | ✅ | [11](11-portal-solicitud-formulario.jpg) |
| 12 | Solicitud de cita enviada (no reserva horario) | ✅ | [12](12-portal-solicitud-enviada.jpg) |
| 13 | Diseño responsive en móvil (390 px) | ✅ | [13](13-portal-movil.jpg) |
| 14 | Menú de navegación móvil | ✅ | [14](14-portal-movil-menu.jpg) |

## 2. Autenticación, usuarios, servicios y profesionales (RF-02, RF-05, RF-13)

| # | Prueba | Resultado | Evidencia |
| --- | --- | --- | --- |
| 15 | Inicio de sesión con contraseña incorrecta | ✅ Rechazado | [15](15-login-error.jpg) |
| 16 | Inicio de sesión del administrador y panel | ✅ | [16](16-panel-administrador.jpg) |
| 17 | Listado de usuarios (sin contraseñas ni hashes) | ✅ | [17](17-usuarios-lista.jpg) |
| 18–19 | Registrar usuario con rol | ✅ | [18](18-usuarios-nuevo.jpg), [19](19-usuarios-creado.jpg) |
| 20 | Restablecer contraseña (operación protegida) | ✅ | [20](20-usuarios-restablecer-password.jpg) |
| 21 | Desactivar usuario | ✅ | [21](21-usuarios-desactivado.jpg) |
| 22–24 | Crear servicio con precio en quetzales | ✅ | [22](22-servicios-lista.jpg), [23](23-servicios-nuevo-con-precio.jpg), [24](24-servicios-creado.jpg) |
| 25–27 | Registrar profesional con usuario de acceso | ✅ | [25](25-profesionales-lista.jpg), [26](26-profesionales-nuevo.jpg), [27](27-profesionales-creado.jpg) |

## 3. Pacientes y responsables (RF-03, RF-04)

| # | Prueba | Resultado | Evidencia |
| --- | --- | --- | --- |
| 28 | Listado de pacientes con fotografía, edad y estado | ✅ | [28](28-pacientes-lista.jpg) |
| 29 | Registrar paciente menor de edad; la edad se calcula automáticamente | ✅ | [29](29-pacientes-nuevo-menor-edad.jpg) |
| 30 | Búsqueda sin distinguir acentos | ✅ | [30](30-pacientes-busqueda.jpg) |
| 32 | **RN-04:** un menor sin responsable no puede recibir cita | ✅ Bloqueado | [32](32-citas-rn04-menor-sin-responsable.jpg) |
| 33–34 | Registrar responsable con fotografía y parentesco | ✅ | [33](33-responsables-lista.jpg), [34](34-responsables-nuevo.jpg) |
| 35–36 | Asociar responsable a paciente | ✅ | [35](35-responsables-asociar-paciente.jpg), [36](36-responsables-asociado.jpg) |
| 79–82 | Detalle del paciente: datos, historial de citas, historial de pagos y materiales | ✅ | [79](79-paciente-detalle.jpg), [80](80-paciente-historial-citas.jpg), [81](81-paciente-historial-pagos.jpg), [82](82-paciente-materiales-asignados.jpg) |
| 115 | Desactivar paciente (eliminación lógica: sigue en la base como INACTIVO) | ✅ | [115](115-pacientes-desactivar-logico.jpg) |
| 116–117 | Editar y reactivar paciente | ✅ | [116](116-pacientes-editar.jpg), [117](117-pacientes-actualizado-reactivado.jpg) |

## 4. Citas, calendario y solicitudes (RF-06, RF-07, RF-08)

| # | Prueba | Resultado | Evidencia |
| --- | --- | --- | --- |
| 31 | Formulario con horarios disponibles, hora de fin calculada (RN-12) y precio copiado del servicio | ✅ | [31](31-citas-formulario-disponibilidad.jpg) |
| 37 | Programar cita al menor una vez asociado su responsable | ✅ | [37](37-citas-programada-menor-con-responsable.jpg) |
| 38 | **RN-01:** otra cita en un horario ocupado del mismo profesional | ✅ Bloqueado | [38](38-citas-rn01-horario-ocupado.jpg) |
| 39 | **RN-02:** cita que termina fuera del horario de atención | ✅ Bloqueado | [39](39-citas-rn02-fuera-de-horario.jpg) |
| 40 | **RN-11:** cita en fecha pasada | ✅ Bloqueado | [40](40-citas-rn11-fecha-pasada.jpg) |
| 41–42 | Programar cita con el servicio de Q250.00 | ✅ | [41](41-citas-programar-servicio-q250.jpg), [42](42-citas-detalle-pendiente.jpg) |
| 43 | Confirmar cita | ✅ | [43](43-citas-confirmada.jpg) |
| 44 | Calendario mensual con días que tienen citas | ✅ | [44](44-calendario-mes.jpg) |
| 45 | Citas de una fecha: paciente, servicio, profesional, horario y estado | ✅ | [45](45-calendario-citas-del-dia.jpg) |
| 46 | Seleccionar una cita del calendario para ver su detalle | ✅ | [46](46-calendario-detalle-cita.jpg) |
| 47 | Filtrar citas por profesional, fecha y estado | ✅ | [47](47-citas-filtro-profesional-estado.jpg) |
| 48–49 | Reprogramar cita (queda en el historial) | ✅ | [48](48-citas-reprogramar.jpg), [49](49-citas-reprogramada-historial.jpg) |
| 50–51 | Cancelar cita con motivo; ya no se puede completar ni reprogramar (RN-05) | ✅ | [50](50-citas-cancelar-motivo.jpg), [51](51-citas-cancelada.jpg) |
| 52–53 | Convertir una solicitud del portal en cita de un paciente registrado | ✅ | [52](52-solicitudes-pendientes.jpg), [53](53-solicitudes-convertir-en-cita.jpg) |
| 54–55 | La solicitud atendida conserva la referencia a la cita generada | ✅ | [54](54-solicitudes-atendidas.jpg), [55](55-solicitudes-referencia-cita.jpg) |
| 56–57 | Rechazar solicitud con motivo | ✅ | [56](56-solicitudes-rechazar.jpg), [57](57-solicitudes-rechazada.jpg) |

## 5. Materiales (RF-09)

| # | Prueba | Resultado | Evidencia |
| --- | --- | --- | --- |
| 58–60 | Registrar material | ✅ | [58](58-materiales-lista.jpg), [59](59-materiales-nuevo.jpg), [60](60-materiales-creado.jpg) |
| 61–62 | Asignar material a un paciente activo y consultar asignaciones | ✅ | [61](61-materiales-asignar-paciente.jpg), [62](62-materiales-asignaciones.jpg) |

## 6. Pagos y caja diaria (RF-10, RF-11)

Recorrido del procedimiento de evaluación funcional del enunciado: caja con Q200.00 iniciales y cita de Q250.00.

| # | Prueba | Resultado | Evidencia |
| --- | --- | --- | --- |
| 63 | **RN-20:** sin caja abierta no se pueden registrar pagos | ✅ Bloqueado | [63](63-pagos-rn20-sin-caja-abierta.jpg) |
| 64–65 | Abrir caja con monto inicial de Q200.00 | ✅ | [64](64-caja-abrir.jpg), [65](65-caja-abierta-monto-inicial.jpg) |
| 66–67 | Abono parcial de Q100.00: saldo Q150.00 y estado **PARCIAL** | ✅ | [66](66-pagos-abono-formulario.jpg), [67](67-pagos-abono-parcial-saldo.jpg) |
| 68 | **RN-17:** pago mayor al saldo | ✅ Bloqueado | [68](68-pagos-rn17-excede-saldo.jpg) |
| 69 | **RN-16:** pago de Q0.00 | ✅ Bloqueado | [69](69-pagos-rn16-monto-cero.jpg) |
| 70 | Segundo pago de Q150.00 por transferencia: saldo Q0.00 y estado **PAGADO** | ✅ | [70](70-pagos-segundo-pago-pagado.jpg) |
| 71 | **RN-27:** cancelar una cita con pagos válidos | ✅ Bloqueado | [71](71-citas-rn27-cancelar-con-pagos.jpg) |
| 72 | Comprobante interno con número único | ✅ | [72](72-pagos-comprobante.jpg) |
| 73 | Pago completo con tarjeta | ✅ | [73](73-pagos-tarjeta-pago-completo.jpg) |
| 74–75 | Anular pago con justificación: el saldo se recalcula y la cita vuelve a PENDIENTE | ✅ | [74](74-pagos-anular-justificacion.jpg), [75](75-pagos-anulado-saldo-recalculado.jpg) |
| 76 | Ingresos del día por método; el pago anulado no se suma (RN-19) | ✅ | [76](76-pagos-ingresos-del-dia-por-metodo.jpg) |
| 77 | Filtrar pagos por método | ✅ | [77](77-pagos-filtro-metodo-efectivo.jpg) |
| 78 | Saldos pendientes | ✅ | [78](78-pagos-saldos-pendientes.jpg) |
| 83–84 | Resumen de caja en vivo y movimientos | ✅ | [83](83-caja-resumen-en-vivo.jpg), [84](84-caja-movimientos.jpg) |
| 85 | Cierre con efectivo contado de Q290.00: diferencia **-Q10.00 (Q10.00 faltantes)** | ✅ | [85](85-caja-cerrar-diferencia.jpg) |
| 86 | Caja cerrada con totales por método (RN-23) | ✅ | [86](86-caja-cerrada-resumen.jpg) |
| 87 | Los pagos de una caja cerrada ya no se pueden anular | ✅ | [87](87-caja-cerrada-pago-bloqueado-anulacion.jpg) |
| 88 | **RN-21:** la caja cerrada no admite pagos nuevos | ✅ Bloqueado | [88](88-caja-cerrada-no-admite-pagos.jpg) |
| 89–91 | Cierres anteriores y detalle de pagos de un cierre | ✅ | [89](89-cajas-cierres-anteriores.jpg), [90](90-caja-detalle-cierre.jpg), [91](91-caja-detalle-movimientos.jpg) |

## 7. Contenido institucional y mensajes (RF-12)

| # | Prueba | Resultado | Evidencia |
| --- | --- | --- | --- |
| 92–93 | Editar nombre del centro y logotipo; carrusel de 5 imágenes | ✅ | [92](92-contenido-informacion-principal.jpg), [93](93-contenido-carrusel-5-imagenes.jpg) |
| 94–95 | Editar la misión; el portal muestra los cambios sin tocar código | ✅ | [94](94-contenido-editar-mision.jpg), [95](95-portal-refleja-cambios.jpg) |
| 96–97 | Publicar contenido educativo | ✅ | [96](96-contenido-educativo-lista.jpg), [97](97-contenido-educativo-nuevo.jpg) |
| 98 | Editar horarios de atención | ✅ | [98](98-contenido-horarios-editados.jpg) |
| 99–100 | Consultar mensajes de contacto y marcarlos como leídos | ✅ | [99](99-mensajes-contacto.jpg), [100](100-mensajes-marcado-leido.jpg) |

## 8. Permisos por rol (RF-02, RN-08, RN-10)

| # | Prueba | Resultado | Evidencia |
| --- | --- | --- | --- |
| 101 | **RN-08:** un usuario inactivo no puede iniciar sesión | ✅ Bloqueado | [101](101-rn08-usuario-inactivo-no-inicia.jpg) |
| 102 | Recepcionista: menú sin usuarios, contenido, mensajes ni materiales | ✅ | [102](102-recepcionista-panel-menu.jpg) |
| 103 | Recepcionista entra por URL a Usuarios: se le niega con aviso | ✅ | [103](103-recepcionista-acceso-denegado.jpg) |
| 104 | Recepcionista solo ve sus propias cajas | ✅ | [104](104-recepcionista-solo-sus-cajas.jpg) |
| 105 | Recepcionista consulta servicios sin poder editarlos | ✅ | [105](105-recepcionista-servicios-consulta.jpg) |
| 106 | Profesional: solo ve sus citas asignadas | ✅ | [106](106-profesional-mis-citas.jpg) |
| 107–108 | Profesional marca una cita como completada; no ve información financiera | ✅ | [107](107-profesional-cita-sin-finanzas.jpg), [108](108-profesional-marca-completada.jpg) |
| 109 | Profesional: información básica de sus pacientes | ✅ | [109](109-profesional-mis-pacientes.jpg) |
| 110 | Profesional entra por URL a Pagos: se le niega con aviso | ✅ | [110](110-profesional-sin-acceso-pagos.jpg) |
| 111–112 | Profesional consulta y asigna materiales a sus pacientes | ✅ | [111](111-profesional-materiales.jpg), [112](112-profesional-asigna-material.jpg) |
| 113 | Calendario del profesional con solo sus citas | ✅ | [113](113-profesional-calendario.jpg) |
| 114 | Cambio de contraseña con la contraseña actual incorrecta | ✅ Rechazado | [114](114-mi-cuenta-cambiar-password.jpg) |

Los mismos permisos se comprueban contra la API (respuestas 401/403) en la carpeta "11 Seguridad y permisos" de la colección de Postman.

## Fallas encontradas y corregidas

| Falla | Corrección |
| --- | --- |
| Al corregir un campo, su mensaje de error seguía visible hasta volver a enviar el formulario (por ejemplo "La fecha no puede ser pasada" con una fecha ya válida). Afectaba a todos los formularios del sistema. | `FormField` oculta el error del campo en cuanto se edita y lo vuelve a mostrar si la validación lo repite al enviar. |
| Al entrar por URL a una sección no permitida, el sistema redirigía al panel sin explicar el motivo. | La guarda del router muestra "No tiene permisos para acceder a esa sección". |

Ambas correcciones se verificaron de nuevo en el navegador.

## Observaciones

- El buscador de pacientes de los formularios de cita y de asignación de materiales solo muestra pacientes activos, así que RN-09 y RN-14 se cumplen desde la interfaz. El backend también las valida: si se intenta por la API, responde 422.
- En una cita cancelada sin pagos, el estado financiero sigue mostrando "Pendiente de pago". Es correcto según los tres estados financieros del enunciado, pero esa cita ya no admite pagos.
