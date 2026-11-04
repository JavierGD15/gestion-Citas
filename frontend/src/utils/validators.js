export const requerido = (valor) => (valor !== null && valor !== undefined && String(valor).trim() !== '') || 'Este campo es obligatorio';

export const correo = (valor) => !valor || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor) || 'Ingrese un correo electrónico válido';

export const telefono = (valor) => !valor || /^[0-9+\-\s]{8,20}$/.test(valor) || 'Ingrese un teléfono válido de al menos 8 dígitos';

export const minimo = (n) => (valor) => !valor || String(valor).trim().length >= n || `Debe tener al menos ${n} caracteres`;

export const password = (valor) => !valor || (/^(?=.*[A-Za-z])(?=.*\d).{8,72}$/.test(valor)) || 'Debe tener al menos 8 caracteres, letras y números';

export const montoPositivo = (valor) => (valor !== '' && Number(valor) > 0 && /^\d+(\.\d{1,2})?$/.test(String(valor))) || 'Ingrese un monto mayor a cero con máximo dos decimales';

export const montoNoNegativo = (valor) => (valor !== '' && Number(valor) >= 0 && /^\d+(\.\d{1,2})?$/.test(String(valor))) || 'Ingrese un monto válido con máximo dos decimales';

export function validarFormulario(valores, reglas) {
  const errores = {};
  Object.entries(reglas).forEach(([campo, validaciones]) => {
    for (const validacion of validaciones) {
      const resultado = validacion(valores[campo], valores);
      if (resultado !== true) {
        errores[campo] = resultado;
        break;
      }
    }
  });
  return errores;
}
