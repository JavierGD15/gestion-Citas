import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import {
  AsignacionMaterial,
  Caja,
  Cita,
  ContenidoInstitucional,
  Contador,
  Horario,
  Material,
  MensajeContacto,
  Paciente,
  Pago,
  Profesional,
  Responsable,
  Servicio,
  SolicitudCita,
  Usuario
} from '../models/index.js';
import { totalesPorCaja } from '../services/finanzas.service.js';
import { combinarFechaHora, fechaSoloDia, hoyISO, sumarMinutos } from '../utils/fechas.js';
import { ESTADOS_CAJA, ESTADOS_CITA, ESTADOS_PAGO, ESTADOS_SOLICITUD, ROLES, TIPOS_CONTENIDO } from '../constants/index.js';
import {
  CONTENIDO,
  HORARIOS,
  MATERIALES,
  MENSAJES,
  PACIENTES,
  PASSWORDS,
  RESPONSABLES,
  SERVICIOS,
  SOLICITUDES,
  USUARIOS
} from './datos.js';

const pad = (numero, largo) => String(numero).padStart(largo, '0');

function sumarDias(fechaISO, dias) {
  const fecha = new Date(`${fechaISO}T12:00:00.000Z`);
  fecha.setUTCDate(fecha.getUTCDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

function diaHabil(desplazamiento) {
  let fecha = hoyISO();
  const paso = desplazamiento >= 0 ? 1 : -1;
  let restantes = Math.abs(desplazamiento);
  const esHabil = (iso) => {
    const dia = new Date(`${iso}T12:00:00.000Z`).getUTCDay();
    return dia >= 1 && dia <= 5;
  };
  if (desplazamiento === 0) {
    while (!esHabil(fecha)) {
      fecha = sumarDias(fecha, 1);
    }
    return fecha;
  }
  while (restantes > 0) {
    fecha = sumarDias(fecha, paso);
    if (esHabil(fecha)) {
      restantes -= 1;
    }
  }
  return fecha;
}

function fechaNacimiento(anios, indice) {
  const hoy = hoyISO();
  const anio = Number(hoy.slice(0, 4)) - anios - 1;
  const mes = pad(((indice * 3) % 12) + 1, 2);
  const dia = pad(((indice * 5) % 27) + 1, 2);
  return fechaSoloDia(`${anio}-${mes}-${dia}`);
}

async function limpiarBase() {
  await mongoose.connection.dropDatabase();
  await Promise.all(
    [Usuario, Profesional, Servicio, Paciente, Responsable, Cita, SolicitudCita, Material, AsignacionMaterial, ContenidoInstitucional, Horario, MensajeContacto, Pago, Caja].map(
      (modelo) => modelo.syncIndexes()
    )
  );
}

async function crearUsuarios() {
  const admin = await Usuario.create({ ...USUARIOS.administrador, password: PASSWORDS.administrador, rol: ROLES.ADMINISTRADOR });
  const recepcionistas = [];
  for (const datos of USUARIOS.recepcionistas) {
    recepcionistas.push(await Usuario.create({ ...datos, password: PASSWORDS.recepcionista, rol: ROLES.RECEPCIONISTA }));
  }
  const profesionales = [];
  for (const { nombres, apellidos, correo, ...perfil } of USUARIOS.profesionales) {
    const usuario = await Usuario.create({ nombres, apellidos, correo, password: PASSWORDS.profesional, rol: ROLES.PROFESIONAL });
    profesionales.push(await Profesional.create({ ...perfil, usuario: usuario._id }));
  }
  return { admin, recepcionistas, profesionales };
}

async function crearContenido(admin) {
  await ContenidoInstitucional.create([
    { tipo: TIPOS_CONTENIDO.GENERAL, clave: 'general', titulo: 'Información principal', ...CONTENIDO.general, actualizadoPor: admin._id },
    { tipo: TIPOS_CONTENIDO.MISION, clave: 'mision', titulo: 'Misión', descripcion: CONTENIDO.mision, imagen: 'https://picsum.photos/seed/sigca-mision/800/450', actualizadoPor: admin._id },
    { tipo: TIPOS_CONTENIDO.VISION, clave: 'vision', titulo: 'Visión', descripcion: CONTENIDO.vision, imagen: 'https://picsum.photos/seed/sigca-vision/800/450', actualizadoPor: admin._id },
    { tipo: TIPOS_CONTENIDO.CONTACTO, clave: 'contacto', titulo: 'Información de contacto', datos: CONTENIDO.contacto, actualizadoPor: admin._id },
    ...CONTENIDO.educativo.map(({ diasAtras, ...item }, indice) => ({
      ...item,
      tipo: TIPOS_CONTENIDO.EDUCATIVO,
      orden: indice,
      fechaPublicacion: fechaSoloDia(sumarDias(hoyISO(), -diasAtras)),
      actualizadoPor: admin._id
    })),
    ...CONTENIDO.corporativo.map((item, indice) => ({ ...item, tipo: TIPOS_CONTENIDO.CORPORATIVO, orden: indice, actualizadoPor: admin._id }))
  ]);
  await Horario.create(HORARIOS);
  await MensajeContacto.create(
    MENSAJES.map((mensaje) => (mensaje.leido ? { ...mensaje, leidoPor: admin._id, fechaLectura: new Date() } : mensaje))
  );
}

async function crearPacientes(recepcionista) {
  const pacientes = [];
  for (const [indice, { anios, ...datos }] of PACIENTES.entries()) {
    pacientes.push(
      await Paciente.create({
        ...datos,
        codigo: `PAC-${pad(indice + 1, 5)}`,
        fechaNacimiento: fechaNacimiento(anios, indice),
        fechaInicioProceso: fechaSoloDia(sumarDias(hoyISO(), -60 + indice * 4)),
        fotografia: `https://i.pravatar.cc/150?img=${indice + 10}`,
        observaciones: indice === 9 ? 'Proceso finalizado. Paciente dado de alta.' : '',
        registradoPor: recepcionista._id
      })
    );
  }
  for (const [indice, { pacientes: indices, ...datos }] of RESPONSABLES.entries()) {
    await Responsable.create({
      ...datos,
      codigo: `RES-${pad(indice + 1, 5)}`,
      fotografia: `https://i.pravatar.cc/150?img=${indice + 40}`,
      pacientes: indices.map((i) => pacientes[i]._id),
      registradoPor: recepcionista._id
    });
  }
  return pacientes;
}

function definirCitas() {
  return [
    { p: 0, s: 1, pr: 1, dia: -3, hora: '09:00', estado: ESTADOS_CITA.COMPLETADA, pagos: [{ caja: 0, monto: 20000, metodo: 'EFECTIVO' }] },
    { p: 1, s: 3, pr: 1, dia: -3, hora: '10:00', estado: ESTADOS_CITA.COMPLETADA, pagos: [{ caja: 0, monto: 10000, metodo: 'EFECTIVO' }] },
    { p: 5, s: 0, pr: 0, dia: -3, hora: '09:00', estado: ESTADOS_CITA.COMPLETADA, pagos: [{ caja: 0, monto: 25000, metodo: 'TARJETA', referencia: 'AUT-482910' }] },
    { p: 6, s: 4, pr: 0, dia: -3, hora: '11:00', estado: ESTADOS_CITA.CANCELADA, motivo: 'El paciente informó que no podrá asistir por viaje.' },
    { p: 2, s: 2, pr: 2, dia: -2, hora: '08:00', estado: ESTADOS_CITA.COMPLETADA, pagos: [{ caja: 1, monto: 35000, metodo: 'TRANSFERENCIA', referencia: 'TRX-77120' }] },
    {
      p: 7,
      s: 0,
      pr: 0,
      dia: -2,
      hora: '10:00',
      estado: ESTADOS_CITA.COMPLETADA,
      pagos: [
        { caja: 1, monto: 15000, metodo: 'EFECTIVO' },
        { caja: 1, monto: 10000, metodo: 'EFECTIVO', anular: 'Pago registrado por error, el paciente pagará el resto la próxima sesión.' }
      ]
    },
    { p: 3, s: 3, pr: 1, dia: -1, hora: '09:00', estado: ESTADOS_CITA.COMPLETADA },
    { p: 8, s: 4, pr: 2, dia: -1, hora: '14:00', estado: ESTADOS_CITA.COMPLETADA, pagos: [{ caja: 2, monto: 27500, metodo: 'EFECTIVO' }] },
    { p: 8, s: 0, pr: 0, dia: 1, hora: '09:00', estado: ESTADOS_CITA.CONFIRMADA, pagos: [{ caja: 2, monto: 10000, metodo: 'TRANSFERENCIA', referencia: 'TRX-90021' }] },
    { p: 0, s: 1, pr: 1, dia: 1, hora: '10:00', estado: ESTADOS_CITA.CONFIRMADA, pagos: [{ caja: 2, monto: 20000, metodo: 'EFECTIVO' }] },
    { p: 5, s: 0, pr: 0, dia: 1, hora: '11:00', estado: ESTADOS_CITA.PENDIENTE },
    { p: 2, s: 2, pr: 2, dia: 2, hora: '08:30', estado: ESTADOS_CITA.PENDIENTE },
    {
      p: 6,
      s: 4,
      pr: 0,
      dia: 2,
      hora: '14:00',
      estado: ESTADOS_CITA.CONFIRMADA,
      pagos: [{ caja: 2, monto: 5000, metodo: 'EFECTIVO', anular: 'Monto digitado incorrectamente al registrar el pago.' }]
    },
    { p: 0, s: 3, pr: 1, dia: 3, hora: '09:00', estado: ESTADOS_CITA.PENDIENTE, solicitud: 3 },
    { p: 7, s: 0, pr: 0, dia: 3, hora: '15:00', estado: ESTADOS_CITA.PENDIENTE }
  ];
}

async function crearCitas({ pacientes, servicios, profesionales, recepcionistas, admin }) {
  const citas = [];
  for (const [indice, definicion] of definirCitas().entries()) {
    const servicio = servicios[definicion.s];
    const fecha = diaHabil(definicion.dia);
    const horaFin = sumarMinutos(definicion.hora, servicio.duracionMinutos);
    const inicio = combinarFechaHora(fecha, definicion.hora);
    const creador = recepcionistas[indice % 2];
    const historial = [{ accion: 'PROGRAMADA', estado: ESTADOS_CITA.PENDIENTE, detalle: `${fecha} ${definicion.hora}`, usuario: creador._id, fecha: new Date(inicio.getTime() - 5 * 86400000) }];
    if ([ESTADOS_CITA.CONFIRMADA, ESTADOS_CITA.COMPLETADA].includes(definicion.estado)) {
      historial.push({ accion: 'CAMBIO_ESTADO', estado: ESTADOS_CITA.CONFIRMADA, usuario: creador._id, fecha: new Date(inicio.getTime() - 2 * 86400000) });
    }
    if (definicion.estado === ESTADOS_CITA.COMPLETADA) {
      historial.push({ accion: 'CAMBIO_ESTADO', estado: ESTADOS_CITA.COMPLETADA, usuario: profesionales[definicion.pr].usuario, fecha: new Date(inicio.getTime() + servicio.duracionMinutos * 60000) });
    }
    if (definicion.estado === ESTADOS_CITA.CANCELADA) {
      historial.push({ accion: 'CAMBIO_ESTADO', estado: ESTADOS_CITA.CANCELADA, detalle: definicion.motivo, usuario: admin._id, fecha: new Date(inicio.getTime() - 86400000) });
    }
    citas.push({
      definicion,
      documento: await Cita.create({
        codigo: `CIT-${pad(indice + 1, 6)}`,
        paciente: pacientes[definicion.p]._id,
        servicio: servicio._id,
        profesional: profesionales[definicion.pr]._id,
        fecha,
        horaInicio: definicion.hora,
        horaFin,
        inicio,
        fin: new Date(inicio.getTime() + servicio.duracionMinutos * 60000),
        duracionMinutos: servicio.duracionMinutos,
        precioCentavos: servicio.precioCentavos,
        estado: definicion.estado,
        motivoCancelacion: definicion.motivo || '',
        observaciones: indice % 4 === 0 ? 'Paciente puntual. Traer informe de la sesión anterior.' : '',
        creadoPor: creador._id,
        historial,
        createdAt: new Date(inicio.getTime() - 5 * 86400000)
      })
    });
  }
  return citas;
}

const CAJAS = (recepcionistas) => [
  { usuario: recepcionistas[0], dia: -3, inicial: 20000, contado: 49000, observaciones: 'Faltante de Q10.00 pendiente de revisión.' },
  { usuario: recepcionistas[1], dia: -2, inicial: 15000, contado: 30000, observaciones: 'Caja cuadrada.' },
  { usuario: recepcionistas[0], dia: 0, inicial: 20000 }
];

async function registrarPagosDeCaja(citas, indiceCaja, caja, definicion, estado) {
  const anio = new Date().getFullYear();
  for (const { definicion: definicionCita, documento: cita } of citas) {
    for (const datosPago of (definicionCita.pagos || []).filter((pago) => pago.caja === indiceCaja)) {
      estado.secuencia += 1;
      estado.minutos += 7;
      const fechaPago =
        definicion.dia === 0 ? new Date(caja.fechaApertura.getTime() + estado.minutos * 60000) : new Date(cita.fin.getTime() + 10 * 60000);
      const pago = await Pago.create({
        comprobante: `REC-${anio}-${pad(estado.secuencia, 6)}`,
        paciente: cita.paciente,
        cita: cita._id,
        caja: caja._id,
        montoCentavos: datosPago.monto,
        metodo: datosPago.metodo,
        referencia: datosPago.referencia || '',
        fechaPago,
        registradoPor: definicion.usuario._id
      });
      if (datosPago.anular) {
        pago.set({
          estado: ESTADOS_PAGO.ANULADO,
          motivoAnulacion: datosPago.anular,
          anuladoPor: definicion.usuario._id,
          fechaAnulacion: new Date(fechaPago.getTime() + 15 * 60000)
        });
        await pago.save();
      } else {
        await Cita.updateOne({ _id: cita._id }, { $inc: { pagosRegistradosCentavos: datosPago.monto } });
      }
    }
  }
}

async function cerrarCaja(caja, definicion, fecha) {
  const totales = await totalesPorCaja(caja._id);
  const esperado = caja.montoInicialCentavos + totales.efectivo;
  await Caja.updateOne(
    { _id: caja._id },
    {
      estado: ESTADOS_CAJA.CERRADA,
      totalEfectivoCentavos: totales.efectivo,
      totalTransferenciaCentavos: totales.transferencia,
      totalTarjetaCentavos: totales.tarjeta,
      totalIngresosCentavos: totales.ingresos,
      efectivoEsperadoCentavos: esperado,
      efectivoContadoCentavos: definicion.contado,
      diferenciaCentavos: definicion.contado - esperado,
      cantidadPagos: totales.cantidadPagos,
      cantidadAnulados: totales.cantidadAnulados,
      fechaCierre: combinarFechaHora(fecha, '17:30'),
      cerradoPor: definicion.usuario._id,
      observacionesCierre: definicion.observaciones
    }
  );
}

async function crearCajasYPagos(citas, recepcionistas) {
  const estado = { secuencia: 0, minutos: 0 };
  const definiciones = CAJAS(recepcionistas);
  for (const [indice, definicion] of definiciones.entries()) {
    const fecha = definicion.dia === 0 ? hoyISO() : diaHabil(definicion.dia);
    const apertura = definicion.dia === 0 ? new Date(Date.now() - 3 * 3600000) : combinarFechaHora(fecha, '07:45');
    const caja = await Caja.create({
      codigo: `CAJ-${pad(indice + 1, 5)}`,
      usuario: definicion.usuario._id,
      fechaApertura: apertura,
      montoInicialCentavos: definicion.inicial,
      observacionesApertura: 'Apertura de jornada'
    });
    await registrarPagosDeCaja(citas, indice, caja, definicion, estado);
    if (definicion.contado !== undefined) {
      await cerrarCaja(caja, definicion, fecha);
    }
  }
  return { cajas: definiciones.length, pagos: estado.secuencia };
}

async function crearSolicitudes({ servicios, citas, recepcionistas }) {
  for (const [indice, datos] of SOLICITUDES.entries()) {
    const { servicio, diasAdelante, atendida, rechazada, ...resto } = datos;
    const solicitud = {
      ...resto,
      servicio: servicios[servicio]._id,
      fechaPreferida: fechaSoloDia(sumarDias(hoyISO(), diasAdelante)),
      createdAt: new Date(Date.now() - (indice + 1) * 86400000)
    };
    if (atendida) {
      const cita = citas.find(({ definicion }) => definicion.solicitud === indice).documento;
      Object.assign(solicitud, { estado: ESTADOS_SOLICITUD.ATENDIDA, cita: cita._id, atendidaPor: recepcionistas[0]._id, fechaAtencion: new Date() });
      const creada = await SolicitudCita.create(solicitud);
      await Cita.updateOne({ _id: cita._id }, { solicitud: creada._id });
      continue;
    }
    if (rechazada) {
      Object.assign(solicitud, { estado: ESTADOS_SOLICITUD.RECHAZADA, motivoRechazo: rechazada, atendidaPor: recepcionistas[1]._id, fechaAtencion: new Date() });
    }
    await SolicitudCita.create(solicitud);
  }
}

async function crearMateriales({ admin, pacientes, profesionales }) {
  const materiales = [];
  for (const [indice, datos] of MATERIALES.entries()) {
    materiales.push(await Material.create({ ...datos, codigo: `MAT-${pad(indice + 1, 5)}`, registradoPor: admin._id }));
  }
  await AsignacionMaterial.create([
    { material: materiales[0]._id, paciente: pacientes[5]._id, asignadoPor: profesionales[0].usuario, indicaciones: 'Practicar dos veces al día durante 5 minutos.' },
    { material: materiales[4]._id, paciente: pacientes[7]._id, asignadoPor: profesionales[0].usuario, indicaciones: 'Completar el diario antes de la próxima sesión.' },
    { material: materiales[1]._id, paciente: pacientes[0]._id, asignadoPor: profesionales[1].usuario, indicaciones: 'Escuchar con los padres 15 minutos diarios.' },
    { material: materiales[3]._id, paciente: pacientes[1]._id, asignadoPor: profesionales[1].usuario, indicaciones: '' },
    { material: materiales[2]._id, paciente: pacientes[2]._id, asignadoPor: profesionales[2].usuario, indicaciones: 'Colocar la rutina en un lugar visible.' },
    {
      material: materiales[2]._id,
      paciente: pacientes[3]._id,
      asignadoPor: admin._id,
      estado: 'INACTIVO',
      retiradoPor: admin._id,
      fechaRetiro: new Date(),
      indicaciones: 'Reemplazado por otro material.'
    }
  ]);
}

async function actualizarContadores(totales) {
  const anio = new Date().getFullYear();
  await Contador.insertMany([
    { _id: 'paciente', secuencia: totales.pacientes },
    { _id: 'responsable', secuencia: totales.responsables },
    { _id: 'cita', secuencia: totales.citas },
    { _id: 'material', secuencia: totales.materiales },
    { _id: 'caja', secuencia: totales.cajas },
    { _id: `comprobante-${anio}`, secuencia: totales.pagos }
  ]);
}

async function resumen() {
  const conteos = await Promise.all(
    [
      ['Usuarios', Usuario],
      ['Profesionales', Profesional],
      ['Pacientes', Paciente],
      ['Responsables', Responsable],
      ['Servicios', Servicio],
      ['Citas', Cita],
      ['Solicitudes de cita', SolicitudCita],
      ['Materiales', Material],
      ['Asignaciones de materiales', AsignacionMaterial],
      ['Pagos', Pago],
      ['Cajas', Caja],
      ['Contenido institucional', ContenidoInstitucional],
      ['Horarios', Horario],
      ['Mensajes de contacto', MensajeContacto]
    ].map(async ([nombre, modelo]) => [nombre, await modelo.countDocuments()])
  );
  console.table(Object.fromEntries(conteos));
  console.log('Credenciales de demostración:');
  console.table([
    { rol: 'ADMINISTRADOR', correo: USUARIOS.administrador.correo, password: PASSWORDS.administrador },
    ...USUARIOS.recepcionistas.map((u) => ({ rol: 'RECEPCIONISTA', correo: u.correo, password: PASSWORDS.recepcionista })),
    ...USUARIOS.profesionales.map((u) => ({ rol: 'PROFESIONAL', correo: u.correo, password: PASSWORDS.profesional }))
  ]);
}

async function seed() {
  await connectDB();
  console.log(`Base de datos: ${mongoose.connection.name}. Se eliminarán los datos existentes.`);
  await limpiarBase();

  const { admin, recepcionistas, profesionales } = await crearUsuarios();
  await crearContenido(admin);
  const servicios = await Servicio.create(SERVICIOS);
  const pacientes = await crearPacientes(recepcionistas[0]);
  const citas = await crearCitas({ pacientes, servicios, profesionales, recepcionistas, admin });
  const totalesCaja = await crearCajasYPagos(citas, recepcionistas);
  await crearSolicitudes({ servicios, citas, recepcionistas });
  await crearMateriales({ admin, pacientes, profesionales });
  await actualizarContadores({
    pacientes: PACIENTES.length,
    responsables: RESPONSABLES.length,
    citas: citas.length,
    materiales: MATERIALES.length,
    cajas: totalesCaja.cajas,
    pagos: totalesCaja.pagos
  });

  await resumen();
  console.log('Datos de prueba cargados correctamente');
}

seed()
  .catch((error) => {
    console.error('Error al cargar los datos de prueba:', error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
