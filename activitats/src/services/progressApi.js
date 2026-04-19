/**
 * progressApi.js
 * Thin client for the /api endpoints served by server/index.js
 */

const BASE = 'http://localhost:3001'

/** Register / confirm student identity. Returns { nia, name, created_at }. */
export async function identify(nia, name = '') {
  const res = await fetch(`${BASE}/api/identify`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ nia, name }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

/** Fetch all saved progress rows for a NIA. Returns array of { slug, results, score, … }. */
export async function fetchProgress(nia) {
  const res = await fetch(`${BASE}/api/progress/${encodeURIComponent(nia)}`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

/** Persist the validation results for one exercise. */
export async function saveProgress(nia, slug, results, score, formValues = {}) {
  const res = await fetch(`${BASE}/api/progress`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ nia, slug, results, score, formValues }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

/** Fetch professor table report with fixed exercise order. */
export async function fetchProfessorReport(slugs = [], professorPassword = '') {
  const params = new URLSearchParams()
  if (slugs.length) params.set('slugs', slugs.join(','))
  if (professorPassword) params.set('professorPassword', professorPassword)
  const query = params.toString() ? `?${params.toString()}` : ''
  const res = await fetch(`${BASE}/api/professor/report${query}`, {
    headers: {
      'x-professor-password': professorPassword,
    },
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function fetchVisibleActivities(slugs = []) {
  const query = slugs.length
    ? `?slugs=${encodeURIComponent(slugs.join(','))}`
    : ''
  const res = await fetch(`${BASE}/api/activities${query}`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function fetchProfessorActivities(slugs = [], professorPassword = '') {
  const params = new URLSearchParams()
  if (slugs.length) params.set('slugs', slugs.join(','))
  if (professorPassword) params.set('professorPassword', professorPassword)
  const query = params.toString() ? `?${params.toString()}` : ''
  const res = await fetch(`${BASE}/api/professor/activities${query}`, {
    headers: {
      'x-professor-password': professorPassword,
    },
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function setProfessorActivityVisibility(slug, isVisible, professorPassword = '') {
  const res = await fetch(`${BASE}/api/professor/activities/${encodeURIComponent(slug)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-professor-password': professorPassword,
    },
    body: JSON.stringify({ isVisible, professorPassword }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
