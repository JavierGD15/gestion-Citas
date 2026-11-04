export const PASSWORDS = {
  administrador: 'Admin12345',
  recepcionista: 'Recep12345',
  profesional: 'Prof12345'
};

export const USUARIOS = {
  administrador: { nombres: 'Mariela', apellidos: 'Ortiz Fuentes', correo: 'admin@sigca.local' },
  recepcionistas: [
    { nombres: 'Ana Lucía', apellidos: 'López Morales', correo: 'recepcion1@sigca.local' },
    { nombres: 'Carla Beatriz', apellidos: 'Ruiz Paredes', correo: 'recepcion2@sigca.local' }
  ],
  profesionales: [
    {
      nombres: 'Laura',
      apellidos: 'Méndez Ríos',
      correo: 'laura.mendez@sigca.local',
      especialidad: 'Psicología clínica',
      colegiado: 'PSC-1520',
      telefono: '5510-2001',
      descripcion: 'Atención psicológica para adolescentes y adultos.'
    },
    {
      nombres: 'Diego',
      apellidos: 'Herrera Soto',
      correo: 'diego.herrera@sigca.local',
      especialidad: 'Terapia auditivo verbal',
      colegiado: 'TAV-0874',
      telefono: '5510-2002',
      descripcion: 'Especialista en desarrollo del lenguaje y habilidades auditivas.'
    },
    {
      nombres: 'Sofía',
      apellidos: 'Castro Juárez',
      correo: 'sofia.castro@sigca.local',
      especialidad: 'Psicología infantil',
      colegiado: 'PSC-2033',
      telefono: '5510-2003',
      descripcion: 'Evaluación y acompañamiento psicológico de niños y familias.'
    }
  ]
};

export const SERVICIOS = [
  {
    nombre: 'Atención psicológica individual',
    descripcion: 'Sesión individual enfocada en el bienestar emocional, manejo de ansiedad, estrés y fortalecimiento de habilidades personales.',
    duracionMinutos: 60,
    precioCentavos: 25000,
    imagen: 'https://picsum.photos/seed/sigca-psicologia/800/500'
  },
  {
    nombre: 'Terapia auditivo verbal',
    descripcion: 'Sesiones para desarrollar la escucha y el lenguaje hablado en niños con pérdida auditiva, con participación activa de la familia.',
    duracionMinutos: 45,
    precioCentavos: 20000,
    imagen: 'https://picsum.photos/seed/sigca-auditiva/800/500'
  },
  {
    nombre: 'Evaluación psicológica infantil',
    descripcion: 'Evaluación integral del desarrollo emocional, cognitivo y conductual del niño, con informe y recomendaciones para la familia.',
    duracionMinutos: 90,
    precioCentavos: 35000,
    imagen: 'https://picsum.photos/seed/sigca-evaluacion/800/500'
  },
  {
    nombre: 'Estimulación temprana del lenguaje',
    descripcion: 'Actividades lúdicas para estimular la comunicación, el vocabulario y la comprensión en la primera infancia.',
    duracionMinutos: 45,
    precioCentavos: 18000,
    imagen: 'https://picsum.photos/seed/sigca-lenguaje/800/500'
  },
  {
    nombre: 'Orientación familiar',
    descripcion: 'Espacio de orientación para padres y cuidadores sobre crianza, comunicación y acompañamiento del proceso terapéutico.',
    duracionMinutos: 60,
    precioCentavos: 27500,
    imagen: 'https://picsum.photos/seed/sigca-familia/800/500'
  }
];

export const PACIENTES = [
  { nombres: 'Mateo', apellidos: 'García Pérez', anios: 6, sexo: 'MASCULINO', telefono: '4410-3001', direccion: '5a. avenida 10-20, zona 1, Guatemala' },
  { nombres: 'Valentina', apellidos: 'García Pérez', anios: 9, sexo: 'FEMENINO', telefono: '4410-3001', direccion: '5a. avenida 10-20, zona 1, Guatemala' },
  { nombres: 'Santiago', apellidos: 'Morales Díaz', anios: 7, sexo: 'MASCULINO', telefono: '4410-3003', direccion: 'Calzada Roosevelt 22-43, zona 7, Guatemala' },
  { nombres: 'Isabella', apellidos: 'Ramírez Cruz', anios: 4, sexo: 'FEMENINO', telefono: '4410-3004', direccion: 'Colonia Las Charcas, zona 11, Guatemala' },
  { nombres: 'Emiliano', apellidos: 'Flores Ajú', anios: 12, sexo: 'MASCULINO', telefono: '4410-3005', direccion: 'San Cristóbal, Mixco' },
  { nombres: 'Andrea', apellidos: 'Velásquez Ruiz', anios: 29, sexo: 'FEMENINO', telefono: '4410-3006', direccion: '12 calle 3-55, zona 10, Guatemala' },
  { nombres: 'Jorge', apellidos: 'Pineda López', anios: 41, sexo: 'MASCULINO', telefono: '4410-3007', direccion: 'Boulevard Los Próceres, zona 10, Guatemala' },
  { nombres: 'Gabriela', apellidos: 'Monterroso Paz', anios: 35, sexo: 'FEMENINO', telefono: '4410-3008', direccion: 'Villa Nueva, Guatemala' },
  { nombres: 'Fernando', apellidos: 'Sandoval Rivas', anios: 19, sexo: 'MASCULINO', telefono: '4410-3009', direccion: 'Santa Catarina Pinula' },
  { nombres: 'Lucía', apellidos: 'Herrarte Gil', anios: 52, sexo: 'FEMENINO', telefono: '4410-3010', direccion: 'Antigua Guatemala, Sacatepéquez', estado: 'INACTIVO' }
];

export const RESPONSABLES = [
  { nombres: 'Patricia', apellidos: 'Pérez de García', parentesco: 'Madre', telefono: '5520-4001', correo: 'patricia.perez@correo.test', direccion: '5a. avenida 10-20, zona 1, Guatemala', pacientes: [0, 1] },
  { nombres: 'Ricardo', apellidos: 'Morales Ochoa', parentesco: 'Padre', telefono: '5520-4002', correo: 'ricardo.morales@correo.test', direccion: 'Calzada Roosevelt 22-43, zona 7, Guatemala', pacientes: [2] },
  { nombres: 'Elena', apellidos: 'Cruz Batres', parentesco: 'Madre', telefono: '5520-4003', correo: 'elena.cruz@correo.test', direccion: 'Colonia Las Charcas, zona 11, Guatemala', pacientes: [3] },
  { nombres: 'Rosa', apellidos: 'Ajú Coyoy', parentesco: 'Abuelo(a)', telefono: '5520-4004', correo: 'rosa.aju@correo.test', direccion: 'San Cristóbal, Mixco', pacientes: [4] },
  { nombres: 'Marta', apellidos: 'Díaz Lemus', parentesco: 'Madre', telefono: '5520-4005', correo: 'marta.diaz@correo.test', direccion: 'Calzada Roosevelt 22-43, zona 7, Guatemala', pacientes: [2] }
];

export const MATERIALES = [
  { titulo: 'Guía de respiración para manejar la ansiedad', descripcion: 'Ejercicios de respiración diafragmática para practicar en casa.', tipo: 'DOCUMENTO', enlace: 'https://example.com/materiales/respiracion.pdf' },
  { titulo: 'Canciones para estimular la escucha', descripcion: 'Lista de canciones infantiles recomendadas para trabajar la atención auditiva.', tipo: 'AUDIO', enlace: 'https://example.com/materiales/canciones-escucha' },
  { titulo: 'Rutina visual para la mañana', descripcion: 'Pictogramas para organizar la rutina diaria de los niños.', tipo: 'EJERCICIO', enlace: 'https://example.com/materiales/rutina-visual.pdf' },
  { titulo: 'Video: cómo leer cuentos en voz alta', descripcion: 'Recomendaciones para padres sobre lectura compartida y estimulación del lenguaje.', tipo: 'VIDEO', enlace: 'https://example.com/materiales/lectura-voz-alta' },
  { titulo: 'Diario de emociones', descripcion: 'Formato para registrar emociones y situaciones durante la semana.', tipo: 'DOCUMENTO', enlace: 'https://example.com/materiales/diario-emociones.pdf' }
];

export const CONTENIDO = {
  general: {
    descripcion:
      'Somos un centro dedicado a la atención psicológica y la estimulación auditiva verbal. Acompañamos a niños, jóvenes, adultos y familias con un equipo profesional comprometido.',
    datos: {
      nombreCentro: 'Centro Integral Armonía',
      eslogan: 'Atención psicológica y estimulación auditiva verbal',
      logo: 'https://placehold.co/160x160/2a6f97/ffffff/png?text=CIA',
      piePagina: 'Atención profesional, cercana y humana para toda la familia.',
      carrusel: [
        { imagen: 'https://picsum.photos/seed/sigca-slide-1/1200/500', titulo: 'Bienvenidos a Centro Integral Armonía', descripcion: 'Acompañamos el bienestar emocional de toda la familia.' },
        { imagen: 'https://picsum.photos/seed/sigca-slide-2/1200/500', titulo: 'Terapia auditivo verbal', descripcion: 'Desarrollamos la escucha y el lenguaje desde la primera infancia.' },
        { imagen: 'https://picsum.photos/seed/sigca-slide-3/1200/500', titulo: 'Atención psicológica', descripcion: 'Espacios seguros para crecer y sanar.' },
        { imagen: 'https://picsum.photos/seed/sigca-slide-4/1200/500', titulo: 'Escuela para padres', descripcion: 'Talleres para acompañar la crianza.' },
        { imagen: 'https://picsum.photos/seed/sigca-slide-5/1200/500', titulo: 'Solicite su cita en línea', descripcion: 'Le contactaremos para confirmar fecha y hora.' }
      ]
    }
  },
  mision:
    'Brindar atención psicológica y de estimulación auditiva verbal de calidad, con un enfoque humano, ético e integral que involucre activamente a las familias en cada proceso.',
  vision:
    'Ser un centro de referencia en Guatemala en salud emocional y desarrollo del lenguaje, reconocido por la calidez de su atención y la excelencia de su equipo profesional.',
  contacto: {
    telefono: '2200-1500',
    whatsapp: '5510-1500',
    correo: 'contacto@armonia.test',
    direccion: '6a. avenida 8-45, zona 9, Ciudad de Guatemala',
    facebook: 'https://facebook.com/',
    instagram: 'https://instagram.com/'
  },
  educativo: [
    { titulo: 'Señales de alerta en el desarrollo del lenguaje', descripcion: 'Conozca los hitos del lenguaje por edad y cuándo es recomendable consultar a un especialista.', diasAtras: 3, imagen: 'https://picsum.photos/seed/sigca-edu-1/800/450', enlace: 'https://example.com/blog/senales-lenguaje' },
    { titulo: 'Cómo hablar de emociones con los niños', descripcion: 'Estrategias sencillas para ayudar a los niños a reconocer y expresar lo que sienten.', diasAtras: 10, imagen: 'https://picsum.photos/seed/sigca-edu-2/800/450' },
    { titulo: 'La importancia del juego en la terapia', descripcion: 'El juego como herramienta para el aprendizaje, la comunicación y el vínculo familiar.', diasAtras: 18, imagen: 'https://picsum.photos/seed/sigca-edu-3/800/450' },
    { titulo: 'Higiene del sueño en adolescentes', descripcion: 'Recomendaciones para mejorar el descanso y su impacto en el estado de ánimo.', diasAtras: 30, imagen: 'https://picsum.photos/seed/sigca-edu-4/800/450' }
  ],
  corporativo: [
    { categoria: 'CAPACITACION', titulo: 'Capacitación para docentes: inclusión auditiva en el aula', descripcion: 'Taller dirigido a docentes sobre adaptaciones para estudiantes con pérdida auditiva.', imagenes: ['https://picsum.photos/seed/sigca-cap-1/600/400', 'https://picsum.photos/seed/sigca-cap-2/600/400'] },
    { categoria: 'CAPACITACION', titulo: 'Primeros auxilios psicológicos', descripcion: 'Formación para equipos de recursos humanos en manejo de crisis.', imagenes: ['https://picsum.photos/seed/sigca-cap-3/600/400'] },
    { categoria: 'ESCUELA_PADRES', titulo: 'Escuela para padres 2026', descripcion: 'Ciclo mensual de talleres sobre crianza positiva, límites y comunicación en familia.', imagenes: ['https://picsum.photos/seed/sigca-padres-1/600/400', 'https://picsum.photos/seed/sigca-padres-2/600/400', 'https://picsum.photos/seed/sigca-padres-3/600/400'] },
    { categoria: 'ACTIVIDAD', titulo: 'Jornada de tamizaje auditivo', descripcion: 'Actividad comunitaria gratuita de detección temprana de problemas auditivos.', imagenes: ['https://picsum.photos/seed/sigca-act-1/600/400'] }
  ]
};

export const HORARIOS = [
  { diaSemana: 0, activo: false, horaInicio: '08:00', horaFin: '12:00' },
  { diaSemana: 1, activo: true, horaInicio: '08:00', horaFin: '17:00' },
  { diaSemana: 2, activo: true, horaInicio: '08:00', horaFin: '17:00' },
  { diaSemana: 3, activo: true, horaInicio: '08:00', horaFin: '17:00' },
  { diaSemana: 4, activo: true, horaInicio: '08:00', horaFin: '17:00' },
  { diaSemana: 5, activo: true, horaInicio: '08:00', horaFin: '17:00' },
  { diaSemana: 6, activo: true, horaInicio: '08:00', horaFin: '12:00' }
];

export const MENSAJES = [
  { nombre: 'Héctor Juárez', correo: 'hector.juarez@correo.test', telefono: '3300-1001', asunto: 'Información de terapia auditiva', mensaje: 'Buen día, quisiera saber si atienden a niños de 3 años con implante coclear.' },
  { nombre: 'Claudia Reyes', correo: 'claudia.reyes@correo.test', telefono: '3300-1002', asunto: 'Escuela para padres', mensaje: '¿Cuándo inicia el próximo ciclo de escuela para padres y cuál es el costo?' },
  { nombre: 'Empresa Soluciones S.A.', correo: 'rrhh@soluciones.test', telefono: '3300-1003', asunto: 'Capacitación corporativa', mensaje: 'Nos interesa una capacitación de primeros auxilios psicológicos para 20 colaboradores.', leido: true }
];

export const SOLICITUDES = [
  { nombreSolicitante: 'Mónica Estrada', correo: 'monica.estrada@correo.test', telefono: '3100-5001', servicio: 1, diasAdelante: 4, mensaje: 'Mi hija de 5 años usa audífonos y necesita terapia.' },
  { nombreSolicitante: 'Luis Barrios', correo: 'luis.barrios@correo.test', telefono: '3100-5002', servicio: 0, diasAdelante: 2, mensaje: 'Prefiero horario por la tarde.' },
  { nombreSolicitante: 'Andrea Solís', correo: 'andrea.solis@correo.test', telefono: '3100-5003', servicio: 4, diasAdelante: 6, mensaje: '' },
  { nombreSolicitante: 'Patricia Pérez de García', correo: 'patricia.perez@correo.test', telefono: '5520-4001', servicio: 3, diasAdelante: 3, mensaje: 'Solicito cita para mi hijo Mateo.', atendida: true },
  { nombreSolicitante: 'Usuario de prueba', correo: 'prueba@correo.test', telefono: '3100-5005', servicio: 2, diasAdelante: 1, mensaje: 'Solicitud duplicada.', rechazada: 'Solicitud duplicada, ya se atendió por teléfono.' }
];
