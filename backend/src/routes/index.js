import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import usuarioRoutes from './usuario.routes.js';
import servicioRoutes from './servicio.routes.js';
import contenidoRoutes from './contenido.routes.js';
import horarioRoutes from './horario.routes.js';
import contactoRoutes from './contacto.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/servicios', servicioRoutes);
router.use('/contenido', contenidoRoutes);
router.use('/horarios', horarioRoutes);
router.use('/contacto', contactoRoutes);

export default router;
