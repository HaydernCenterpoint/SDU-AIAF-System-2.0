export function buildDocumentQuery(filters = {}) {
  const params = new URLSearchParams();
  for (const key of ['search', 'tag', 'createdFrom', 'createdTo', 'updatedFrom', 'updatedTo']) {
    const value = typeof filters[key] === 'string' ? filters[key].trim() : '';
    if (value) params.set(key, value);
  }
  return params.toString();
}

export function formatDocumentSize(size) {
  const bytes = Number(size) || 0;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${trimNumber(bytes / 1024)} KB`;
  return `${trimNumber(bytes / 1024 / 1024)} MB`;
}

function trimNumber(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/u, '');
}
