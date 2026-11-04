const MONEY_REGEX = /^\d+(\.\d{1,2})?$/;

export function isValidMoney(value) {
  if (value === null || value === undefined || value === '') {
    return false;
  }
  return MONEY_REGEX.test(String(value).trim());
}

export function toCents(value) {
  if (!isValidMoney(value)) {
    return Number.NaN;
  }
  const [entero, decimales = ''] = String(value).trim().split('.');
  return Number(entero) * 100 + Number(decimales.padEnd(2, '0'));
}

export function fromCents(cents) {
  return Math.round(Number(cents) || 0) / 100;
}
