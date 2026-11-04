import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sigca',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origen) => origen.trim())
    .filter(Boolean),
  tzOffset: process.env.TZ_OFFSET || '-06:00'
};

export function validarEntorno() {
  const errores = [];
  if (!env.jwtSecret) {
    errores.push('La variable JWT_SECRET es obligatoria');
  } else if (env.nodeEnv === 'production' && env.jwtSecret.length < 32) {
    errores.push('JWT_SECRET debe tener al menos 32 caracteres en producción');
  }
  if (!/^[+-]\d{2}:\d{2}$/.test(env.tzOffset)) {
    errores.push('TZ_OFFSET debe tener el formato +HH:MM o -HH:MM');
  }
  if (errores.length > 0) {
    throw new Error(errores.join('. '));
  }
  if (env.jwtSecret.length < 32) {
    console.warn('Advertencia: se recomienda un JWT_SECRET de al menos 32 caracteres');
  }
}

export default env;
