import { Router } from 'express';
import * as controller from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { loginRules, cambiarPasswordRules } from '../validators/auth.validators.js';

const router = Router();

router.post('/login', validate(loginRules), controller.login);
router.get('/me', authenticate, controller.me);
router.put('/password', authenticate, validate(cambiarPasswordRules), controller.cambiarPassword);

export default router;
