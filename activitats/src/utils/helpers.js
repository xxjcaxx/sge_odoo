export function summarizeResults(results) {
  if (!results.length) return 'Sense proves executades'
  const okCount = results.filter((result) => result.status === 'ok').length
  const warnCount = results.filter((result) => result.status === 'warn').length
  const failCount = results.filter((result) => result.status === 'fail').length
  return `${okCount} OK · ${warnCount} parcial · ${failCount} KO`
}

export function extractTitle(content) {
  const match = content.match(/^#{1,6}\s+(.+)$/m)
  return match?.[1]?.trim()
}

export function normalizeError(error) {
  if (error?.name === 'AbortError') return 'Temps d\'espera esgotat en la petició.'
  return error instanceof Error ? error.message : 'Error desconegut.'
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function saveStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function loadStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}
