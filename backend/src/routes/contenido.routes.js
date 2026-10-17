import { Router } from 'express';
import { query } from 'express-validator';
import * as controller from '../controllers/contenido.controller.js';
import validate from '../middlewares/validate.js';
import { TIPOS_CONTENIDO } from '../constants/index.js';

const router = Router();

router.get('/', validate([query('tipo').optional().isIn(Object.values(TIPOS_CONTENIDO)).withMessage('Tipo no válido')]), controller.listar);
router.get('/publico', controller.publico);

export default router;
