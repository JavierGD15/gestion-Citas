import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Usuario from '../models/Usuario.js';
import { ROLES } from '../constants/index.js';

const correo = (process.env.ADMIN_CORREO || 'admin@sigca.local').toLowerCase();
const password = process.env.ADMIN_PASSWORD;

async function crearAdmin() {
  if (!password) {
    throw new Error('Defina ADMIN_PASSWORD en el archivo .env');
  }

  await connectDB();

  const existente = await Usuario.findOne({ correo });
  if (existente) {
    console.log(`El usuario ${correo} ya existe`);
    return;
  }

  await Usuario.create({
    nombres: 'Administrador',
    apellidos: 'SIGCA',
    correo,
    password,
    rol: ROLES.ADMINISTRADOR
  });

  console.log(`Administrador ${correo} creado correctamente`);
}

crearAdmin()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
