import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import env from './config/env.js';
import routes from './routes/index.js';
import notFound from './middlewares/notFound.js';
import errorHandler from './middlewares/errorHandler.js';
import rechazarOperadores from './middlewares/sanitize.js';
import { limitadorGeneral } from './middlewares/rateLimit.js';

const app = express();

app.disable('x-powered-by');
app.set('query parser', 'simple');
app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' } }));
app.use(
  cors({
    origin: (origen, callback) => callback(null, !origen || env.corsOrigins.includes(origen)),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 600
  })
);
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));

if (env.nodeEnv !== 'test') {
  app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
}

app.use('/api', limitadorGeneral, rechazarOperadores, routes);

app.use(notFound);
app.use(errorHandler);

export default app;
