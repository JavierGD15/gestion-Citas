import app from './app.js';
import env from './config/env.js';
import { connectDB } from './config/db.js';

async function start() {
  try {
    await connectDB();
    console.log('MongoDB conectado');
    app.listen(env.port, () => {
      console.log(`SIGCA API escuchando en http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error('No fue posible iniciar el servidor:', error.message);
    process.exit(1);
  }
}

start();
