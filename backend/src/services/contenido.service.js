import ContenidoInstitucional from '../models/ContenidoInstitucional.js';
import { ESTADOS, TIPOS_CONTENIDO } from '../constants/index.js';

const CONTENIDO_BASE = [
  {
    tipo: TIPOS_CONTENIDO.GENERAL,
    clave: 'general',
    titulo: 'Información principal',
    descripcion: 'Acompañamos el desarrollo emocional, auditivo y del lenguaje de niños, jóvenes y adultos.',
    datos: {
      nombreCentro: 'Centro Integral Armonía',
      eslogan: 'Atención psicológica y estimulación auditiva verbal',
      logo: '',
      carrusel: [],
      piePagina: 'Atención profesional, cercana y humana.'
    }
  },
  {
    tipo: TIPOS_CONTENIDO.MISION,
    clave: 'mision',
    titulo: 'Misión',
    descripcion: 'Brindar atención psicológica y de estimulación auditiva verbal de calidad, con un enfoque humano e integral que involucre a las familias.'
  },
  {
    tipo: TIPOS_CONTENIDO.VISION,
    clave: 'vision',
    titulo: 'Visión',
    descripcion: 'Ser un centro de referencia en Guatemala en salud emocional y desarrollo del lenguaje, reconocido por su calidez y excelencia profesional.'
  },
  {
    tipo: TIPOS_CONTENIDO.CONTACTO,
    clave: 'contacto',
    titulo: 'Información de contacto',
    datos: {
      telefono: '',
      correo: '',
      direccion: '',
      whatsapp: '',
      facebook: '',
      instagram: ''
    }
  }
];

export async function asegurarContenidoBase() {
  await Promise.all(
    CONTENIDO_BASE.map((item) =>
      ContenidoInstitucional.updateOne({ clave: item.clave }, { $setOnInsert: item }, { upsert: true })
    )
  );
}

export async function listarPublico(query) {
  const filtro = { estado: ESTADOS.ACTIVO };
  if (query.tipo) {
    filtro.tipo = query.tipo;
  }
  return ContenidoInstitucional.find(filtro).sort({ tipo: 1, orden: 1, fechaPublicacion: -1 });
}

export async function obtenerPublico() {
  const items = await ContenidoInstitucional.find({ estado: ESTADOS.ACTIVO }).sort({ orden: 1, createdAt: 1 });
  const porClave = (clave) => items.find((item) => item.clave === clave) || null;

  return {
    general: porClave('general'),
    mision: porClave('mision'),
    vision: porClave('vision'),
    contacto: porClave('contacto'),
    educativo: items
      .filter((item) => item.tipo === TIPOS_CONTENIDO.EDUCATIVO)
      .sort((a, b) => (b.fechaPublicacion || 0) - (a.fechaPublicacion || 0)),
    corporativo: items.filter((item) => item.tipo === TIPOS_CONTENIDO.CORPORATIVO)
  };
}
