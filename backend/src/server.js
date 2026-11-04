import app from './app.js';
import env, { validarEntorno } from './config/env.js';
import { connectDB } from './config/db.js';
import { asegurarContenidoBase } from './services/contenido.service.js';
import { asegurarHorariosBase } from './services/horario.service.js';

async function start() {
  try {
    validarEntorno();
    await connectDB();
    console.log('MongoDB conectado');
    await Promise.all([asegurarContenidoBase(), asegurarHorariosBase()]);
    app.listen(env.port, () => {
      console.log(`SIGCA API escuchando en http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error('No fue posible iniciar el servidor:', error.message);
    process.exit(1);
  }
}

start();
