import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

function handleValidation(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) {
    return next();
  }
  const details = result.array({ onlyFirstError: true }).map((error) => ({ campo: error.path, mensaje: error.msg }));
  return next(new ApiError(400, 'Los datos enviados no son válidos', details));
}

export default function validate(rules) {
  return [...rules, handleValidation];
}
