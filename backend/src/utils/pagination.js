export function getPagination(query, defaultLimit = 20) {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || defaultLimit, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}

export function buildMeta({ page, limit }, total) {
  return { page, limit, total, pages: Math.max(Math.ceil(total / limit), 1) };
}

export function escapeRegex(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const VARIANTES = {
  a: '[aáàäâ]',
  e: '[eéèëê]',
  i: '[iíìïî]',
  o: '[oóòöô]',
  u: '[uúùüû]',
  n: '[nñ]'
};

export function searchRegex(texto) {
  const base = String(texto)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
  const patron = escapeRegex(base).replace(/[aeioun]/g, (letra) => VARIANTES[letra]);
  return new RegExp(patron, 'i');
}
