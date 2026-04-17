import express from 'express'
import cors    from 'cors'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { mkdirSync } from 'fs'
import { getDb }    from './db.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PORT      = process.env.PORT ?? 3001
const DIST      = join(__dirname, '..', 'dist')
const PROFESSOR_PASSWORD = String(process.env.PROFESSOR_PASSWORD ?? 'professor123').trim()

// Ensure data dir exists before opening DB
mkdirSync(join(__dirname, '..', 'data'), { recursive: true })
const db = getDb()

const app = express()
app.use(cors())
app.use(express.json())

function normalizeBaseUrl(url = '') {
  return String(url).replace(/\/+$/, '')
}

function buildOdooAuthHeaders({ apiKey, database, basicUser, basicPassword }) {
  const headers = {
    'Content-Type': 'application/json',
  }

  if (apiKey) headers.Authorization = `Bearer ${apiKey}`
  if (database) headers['X-Odoo-Database'] = database
  if (basicUser && basicPassword) {
    const encoded = Buffer.from(`${basicUser}:${basicPassword}`).toString('base64')
    headers.Authorization = `Basic ${encoded}`
  }

  return headers
}

function extractProfessorPassword(req) {
  const fromHeader = req.header('x-professor-password')
  const fromQuery = typeof req.query?.professorPassword === 'string' ? req.query.professorPassword : ''
  const fromBody = typeof req.body?.professorPassword === 'string' ? req.body.professorPassword : ''
  return String(fromHeader || fromQuery || fromBody || '').trim()
}

function requireProfessorPassword(req, res, next) {
  const provided = extractProfessorPassword(req)
  if (!provided || provided !== PROFESSOR_PASSWORD) {
    return res.status(401).json({ error: 'Contrasenya de professor incorrecta.' })
  }
  next()
}

// ─── Servir el frontend built ──────────────────────────────────────────────
app.use(express.static(DIST))


// ═══════════════════════════════════════════════════════════════════════════
//  API  /api/identify
//  Body: { nia: string, name?: string }
//  Returns the student record (creates if not exists)
// ═══════════════════════════════════════════════════════════════════════════
app.post('/api/identify', (req, res) => {
  const { nia, name = '' } = req.body ?? {}
  if (!nia || typeof nia !== 'string' || nia.trim() === '') {
    return res.status(400).json({ error: 'NIA obligatori.' })
  }
  const niaClean = nia.trim().toUpperCase()

  const insert = db.prepare(`
    INSERT INTO students (nia, name)
    VALUES (?, ?)
    ON CONFLICT(nia) DO UPDATE SET name = CASE WHEN excluded.name != '' THEN excluded.name ELSE students.name END
  `)
  insert.run(niaClean, name.trim())

  const student = db.prepare('SELECT * FROM students WHERE nia = ?').get(niaClean)
  res.json(student)
})


// ═══════════════════════════════════════════════════════════════════════════
//  API  GET /api/progress/:nia
//  Returns all exercise progress rows for a student
// ═══════════════════════════════════════════════════════════════════════════
app.get('/api/progress/:nia', (req, res) => {
  const nia = req.params.nia.trim().toUpperCase()
  const rows = db.prepare(`
    SELECT slug, results, score, ok_count, warn_count, fail_count, total_count, updated_at
    FROM progress
    WHERE nia = ?
    ORDER BY updated_at DESC
  `).all(nia)

  // Parse JSON results back to objects
  const payload = rows.map((r) => ({
    ...r,
    results: JSON.parse(r.results),
  }))

  res.json(payload)
})


// ═══════════════════════════════════════════════════════════════════════════
//  API  POST /api/progress
//  Body: { nia, slug, results: Array, score: string }
//  Upserts the progress row (one row per student+exercise)
// ═══════════════════════════════════════════════════════════════════════════
app.post('/api/progress', (req, res) => {
  const { nia, slug, results, score } = req.body ?? {}
  if (!nia || !slug || !Array.isArray(results)) {
    return res.status(400).json({ error: 'Falten camps: nia, slug, results.' })
  }
  const niaClean = nia.trim().toUpperCase()

  // Ensure student exists
  db.prepare(`INSERT OR IGNORE INTO students (nia) VALUES (?)`).run(niaClean)

  const ok_count    = results.filter((r) => r.status === 'ok').length
  const warn_count  = results.filter((r) => r.status === 'warn').length
  const fail_count  = results.filter((r) => r.status === 'fail').length
  const total_count = results.length

  db.prepare(`
    INSERT INTO progress (nia, slug, results, score, ok_count, warn_count, fail_count, total_count, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(nia, slug) DO UPDATE SET
      results     = excluded.results,
      score       = excluded.score,
      ok_count    = excluded.ok_count,
      warn_count  = excluded.warn_count,
      fail_count  = excluded.fail_count,
      total_count = excluded.total_count,
      updated_at  = CURRENT_TIMESTAMP
  `).run(niaClean, slug, JSON.stringify(results), score ?? '', ok_count, warn_count, fail_count, total_count)

  res.json({ ok: true })
})


// ═══════════════════════════════════════════════════════════════════════════
//  API  POST /api/odoo/json2
//  Proxy server-side to avoid CORS in browser requests to Odoo
// ═══════════════════════════════════════════════════════════════════════════
app.post('/api/odoo/json2', async (req, res) => {
  //console.log('Rebuda petició JSON-2 al servidor', { body: req.body })
  const {
    odooUrl,
    model,
    method,
    params = {},
    apiKey,
    database,
    basicUser,
    basicPassword,
  } = req.body ?? {}

  if (!odooUrl || !model || !method) {
    return res.status(400).json({ error: 'Falten camps: odooUrl, model, method.' })
  }

  const base = normalizeBaseUrl(odooUrl)
  const upstreamUrl = `${base}/json/2/${model}/${method}`
  const headers = buildOdooAuthHeaders({ apiKey, database, basicUser, basicPassword })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  const parameters = {
      method: 'POST',
      headers,
      body: JSON.stringify(params ?? {}),
      signal: controller.signal,
  }

 //console.log('Enviant petició JSON-2 a Odoo', { url: upstreamUrl, parameters })
  try {
    const upstreamResponse = await fetch(upstreamUrl, parameters)

    const text = await upstreamResponse.text()
    const data = text ? JSON.parse(text) : {}

    if (!upstreamResponse.ok) {
      return res.status(upstreamResponse.status).json(data)
    }

    return res.json(data)
  } catch (error) {
    if (error?.name === 'AbortError') {
      return res.status(504).json({ error: 'Timeout connectant amb Odoo.' })
    }
    return res.status(502).json({ error: error?.message || 'Error connectant amb Odoo.' })
  } finally {
    clearTimeout(timeout)
  }
})

app.post('/api/proxy/http', async (req, res) => {
  const {
    url,
    method = 'GET',
    headers = {},
    body,
  } = req.body ?? {}

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Camp url obligatori.' })
  }

  if (!/^https?:\/\//i.test(url)) {
    return res.status(400).json({ error: 'Només es permeten URLs http/https.' })
  }

  const safeHeaders = { ...headers }
  delete safeHeaders.host
  delete safeHeaders['content-length']

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    const upstreamResponse = await fetch(url, {
      method,
      headers: safeHeaders,
      body,
      signal: controller.signal,
    })

    const bodyText = await upstreamResponse.text()
    let bodyJson = null
    try {
      bodyJson = bodyText ? JSON.parse(bodyText) : null
    } catch {
      bodyJson = null
    }

    return res.status(upstreamResponse.status).json({
      status: upstreamResponse.status,
      ok: upstreamResponse.ok,
      headers: {
        'content-type': upstreamResponse.headers.get('content-type') || '',
      },
      bodyText,
      bodyJson,
    })
  } catch (error) {
    if (error?.name === 'AbortError') {
      return res.status(504).json({ error: 'Timeout en la petició proxy.' })
    }
    return res.status(502).json({ error: error?.message || 'Error al proxy HTTP.' })
  } finally {
    clearTimeout(timeout)
  }
})


// ═══════════════════════════════════════════════════════════════════════════
//  API  Activities visible to students
// ═══════════════════════════════════════════════════════════════════════════
app.get('/api/activities', (req, res) => {
  const slugsQuery = typeof req.query.slugs === 'string' ? req.query.slugs : ''
  const requestedSlugs = slugsQuery
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (!requestedSlugs.length) return res.json([])

  const rows = db.prepare(`
    SELECT slug, is_visible
    FROM practice_visibility
    WHERE slug IN (${requestedSlugs.map(() => '?').join(',')})
  `).all(...requestedSlugs)

  const visibilityBySlug = new Map(rows.map((row) => [row.slug, row.is_visible]))
  const visible = requestedSlugs
    .filter((slug) => (visibilityBySlug.get(slug) ?? 1) === 1)
    .map((slug) => ({ slug, is_visible: 1 }))

  res.json(visible)
})

app.get('/api/professor/activities', requireProfessorPassword, (req, res) => {
  const slugsQuery = typeof req.query.slugs === 'string' ? req.query.slugs : ''
  const requestedSlugs = slugsQuery
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (!requestedSlugs.length) return res.json([])

  const rows = db.prepare(`
    SELECT slug, is_visible
    FROM practice_visibility
    WHERE slug IN (${requestedSlugs.map(() => '?').join(',')})
  `).all(...requestedSlugs)

  const visibilityBySlug = new Map(rows.map((row) => [row.slug, row.is_visible]))
  const payload = requestedSlugs.map((slug) => ({
    slug,
    is_visible: visibilityBySlug.get(slug) ?? 1,
  }))

  res.json(payload)
})

app.patch('/api/professor/activities/:slug', requireProfessorPassword, (req, res) => {
  const slug = String(req.params.slug || '').trim()
  const isVisible = Boolean(req.body?.isVisible)

  if (!slug) {
    return res.status(400).json({ error: 'Slug invàlid.' })
  }

  db.prepare(`
    INSERT INTO practice_visibility (slug, is_visible, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(slug) DO UPDATE SET
      is_visible = excluded.is_visible,
      updated_at = CURRENT_TIMESTAMP
  `).run(slug, isVisible ? 1 : 0)

  const updated = db.prepare(`
    SELECT slug, is_visible, updated_at
    FROM practice_visibility
    WHERE slug = ?
  `).get(slug)

  res.json(updated)
})


// ═══════════════════════════════════════════════════════════════════════════
//  API  GET /api/summary
//  Returns aggregated stats for all students (professor view)
// ═══════════════════════════════════════════════════════════════════════════
app.get('/api/summary', requireProfessorPassword, (_req, res) => {
  const rows = db.prepare(`
    SELECT
      s.nia,
      s.name,
      COUNT(p.slug)              AS exercises_done,
      SUM(p.ok_count)            AS total_ok,
      SUM(p.total_count)         AS total_tests,
      MAX(p.updated_at)          AS last_activity
    FROM students s
    LEFT JOIN progress p ON p.nia = s.nia
    GROUP BY s.nia
    ORDER BY last_activity DESC
  `).all()
  res.json(rows)
})


// ═══════════════════════════════════════════════════════════════════════════
//  API  GET /api/professor/report
//  Query: ?slugs=a,b,c (optional order for exercise columns)
//  Returns per-student table with per-exercise percentages + final grade
// ═══════════════════════════════════════════════════════════════════════════
app.get('/api/professor/report', requireProfessorPassword, (req, res) => {
  const slugsQuery = typeof req.query.slugs === 'string' ? req.query.slugs : ''
  const querySlugs = slugsQuery
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  const students = db.prepare(`
    SELECT nia, name
    FROM students
    ORDER BY nia ASC
  `).all()

  const progressRows = db.prepare(`
    SELECT nia, slug, ok_count, total_count, updated_at
    FROM progress
  `).all()

  const dbSlugs = [...new Set(progressRows.map((row) => row.slug))]
  const slugs = querySlugs.length
    ? [...querySlugs, ...dbSlugs.filter((slug) => !querySlugs.includes(slug))]
    : dbSlugs

  const progressByNia = new Map()
  for (const row of progressRows) {
    if (!progressByNia.has(row.nia)) progressByNia.set(row.nia, {})
    const pct = row.total_count > 0 ? (row.ok_count / row.total_count) * 100 : 0
    progressByNia.get(row.nia)[row.slug] = {
      ok: row.ok_count,
      total: row.total_count,
      pct,
      updatedAt: row.updated_at,
    }
  }

  const rows = students.map((student) => {
    const exercises = progressByNia.get(student.nia) ?? {}
    const grades = slugs.map((slug) => exercises[slug]?.pct ?? 0)
    const finalGrade = grades.length
      ? grades.reduce((sum, value) => sum + value, 0) / grades.length
      : 0

    return {
      nia: student.nia,
      name: student.name,
      exercises,
      finalGrade,
    }
  })

  res.json({ slugs, rows })
})


// ─── SPA fallback ──────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.sendFile(join(DIST, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`\n  Avaluador Odoo — servidor en http://localhost:${PORT}`)
  console.log(`  Panell professor protegit amb variable PROFESSOR_PASSWORD\n`)
})
