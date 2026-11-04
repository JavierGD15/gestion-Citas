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
