import ContenidoInstitucional from '../models/ContenidoInstitucional.js';
import ApiError from '../utils/ApiError.js';
import { fechaSoloDia } from '../utils/fechas.js';
import { CATEGORIAS_CORPORATIVO, CONTENIDO_UNICO, ESTADOS, TIPOS_CONTENIDO } from '../constants/index.js';

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

const LIMITES = { corto: 150, medio: 300, largo: 5000 };

function texto(valor, max = LIMITES.medio) {
  return typeof valor === 'string' ? valor.trim().slice(0, max) : '';
}

function esUrl(valor) {
  return typeof valor === 'string' && /^https?:\/\/\S+$/i.test(valor.trim()) && valor.length <= 500;
}

function urlOpcional(valor, campo) {
  const limpio = texto(valor, 500);
  if (limpio && !esUrl(limpio)) {
    throw new ApiError(400, `El campo ${campo} debe ser una URL válida que inicie con http:// o https://`);
  }
  return limpio;
}

function normalizarGeneral(datos = {}) {
  const nombreCentro = texto(datos.nombreCentro, 100);
  if (nombreCentro.length < 3) {
    throw new ApiError(400, 'El nombre del centro debe tener al menos 3 caracteres');
  }
  const carrusel = Array.isArray(datos.carrusel) ? datos.carrusel : [];
  if (carrusel.length > 12) {
    throw new ApiError(400, 'El carrusel admite un máximo de 12 imágenes');
  }
  return {
    nombreCentro,
    eslogan: texto(datos.eslogan, 200),
    logo: urlOpcional(datos.logo, 'logotipo'),
    piePagina: texto(datos.piePagina, 300),
    carrusel: carrusel.map((slide, indice) => {
      if (!esUrl(slide?.imagen)) {
        throw new ApiError(400, `La imagen ${indice + 1} del carrusel debe ser una URL válida`);
      }
      return { imagen: slide.imagen.trim(), titulo: texto(slide.titulo, LIMITES.corto), descripcion: texto(slide.descripcion, LIMITES.medio) };
    })
  };
}

function normalizarContacto(datos = {}) {
  const correo = texto(datos.correo, 120);
  if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    throw new ApiError(400, 'El correo de contacto no es válido');
  }
  return {
    telefono: texto(datos.telefono, 30),
    whatsapp: texto(datos.whatsapp, 30),
    correo,
    direccion: texto(datos.direccion, 250),
    facebook: urlOpcional(datos.facebook, 'Facebook'),
    instagram: urlOpcional(datos.instagram, 'Instagram')
  };
}

function construirCambios(item, datos) {
  const cambios = {};
  if (datos.titulo !== undefined) {
    cambios.titulo = texto(datos.titulo, 200);
  }
  if (datos.descripcion !== undefined) {
    cambios.descripcion = texto(datos.descripcion, LIMITES.largo);
  }
  if (datos.imagen !== undefined) {
    cambios.imagen = urlOpcional(datos.imagen, 'imagen');
  }

  if (item.tipo === TIPOS_CONTENIDO.GENERAL && datos.datos !== undefined) {
    cambios.datos = normalizarGeneral(datos.datos);
  }
  if (item.tipo === TIPOS_CONTENIDO.CONTACTO && datos.datos !== undefined) {
    cambios.datos = normalizarContacto(datos.datos);
  }

  if ([TIPOS_CONTENIDO.EDUCATIVO, TIPOS_CONTENIDO.CORPORATIVO].includes(item.tipo)) {
    if (datos.enlace !== undefined) {
      cambios.enlace = urlOpcional(datos.enlace, 'enlace');
    }
    if (datos.orden !== undefined) {
      cambios.orden = Number.parseInt(datos.orden, 10) || 0;
    }
    if (datos.imagenes !== undefined) {
      if (!Array.isArray(datos.imagenes) || datos.imagenes.length > 12) {
        throw new ApiError(400, 'Las imágenes deben enviarse como una lista de máximo 12 URL');
      }
      cambios.imagenes = datos.imagenes.map((url, indice) => urlOpcional(url, `imagen ${indice + 1}`)).filter(Boolean);
    }
  }
  if (item.tipo === TIPOS_CONTENIDO.EDUCATIVO && datos.fechaPublicacion !== undefined) {
    cambios.fechaPublicacion = datos.fechaPublicacion ? fechaSoloDia(datos.fechaPublicacion) : new Date();
  }
  if (item.tipo === TIPOS_CONTENIDO.CORPORATIVO && datos.categoria !== undefined) {
    if (!Object.values(CATEGORIAS_CORPORATIVO).includes(datos.categoria)) {
      throw new ApiError(400, 'Categoría corporativa no válida');
    }
    cambios.categoria = datos.categoria;
  }
  return cambios;
}

export async function listarAdmin(query) {
  const filtro = {};
  if (query.tipo) {
    filtro.tipo = query.tipo;
  }
  return ContenidoInstitucional.find(filtro).populate('actualizadoPor', 'nombres apellidos').sort({ tipo: 1, orden: 1, fechaPublicacion: -1, createdAt: -1 });
}

export async function crear(datos, usuario) {
  if (![TIPOS_CONTENIDO.EDUCATIVO, TIPOS_CONTENIDO.CORPORATIVO].includes(datos.tipo)) {
    throw new ApiError(400, 'Solo pueden crearse publicaciones educativas o actividades corporativas');
  }
  const base = new ContenidoInstitucional({ tipo: datos.tipo });
  const cambios = construirCambios(base, { fechaPublicacion: datos.fechaPublicacion ?? '', ...datos });
  if (!cambios.titulo || cambios.titulo.length < 3) {
    throw new ApiError(400, 'El título debe tener al menos 3 caracteres');
  }
  if (datos.tipo === TIPOS_CONTENIDO.CORPORATIVO && !cambios.categoria) {
    throw new ApiError(400, 'Seleccione la categoría de la actividad corporativa');
  }
  base.set({ ...cambios, actualizadoPor: usuario._id });
  await base.save();
  return base;
}

export async function actualizar(id, datos, usuario) {
  const item = await ContenidoInstitucional.findById(id);
  if (!item) {
    throw new ApiError(404, 'Contenido no encontrado');
  }
  item.set({ ...construirCambios(item, datos), actualizadoPor: usuario._id });
  await item.save();
  return item;
}

export async function cambiarEstado(id, estado, usuario) {
  const item = await ContenidoInstitucional.findById(id);
  if (!item) {
    throw new ApiError(404, 'Contenido no encontrado');
  }
  if (CONTENIDO_UNICO.includes(item.tipo)) {
    throw new ApiError(422, 'Este contenido es obligatorio en el portal y no puede desactivarse');
  }
  item.set({ estado, actualizadoPor: usuario._id });
  await item.save();
  return item;
}
