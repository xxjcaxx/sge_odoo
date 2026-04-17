import { COMMON_FIELDS } from './config/commonFields'
import { renderExercisePage } from './components/ExercisePage'
import { renderProfessorPage, renderProfessorPasswordGate } from './components/ProfessorPage'
import { renderNiaModal } from './components/NiaModal'
import { EXERCISE_MAP } from './exercises'
import { createBaseTests } from './services/odooClient'
import {
  identify,
  fetchProgress,
  fetchProfessorReport,
  saveProgress,
  fetchVisibleActivities,
  fetchProfessorActivities,
  setProfessorActivityVisibility,
} from './services/progressApi'
import { extractTitle, loadStorage, normalizeError, saveStorage, summarizeResults } from './utils/helpers'

// --- Importació dels enunciats en ordre de creació del .md ---
import mdInstalar      from './exercises/practica_instalar_odoo.md?raw'
import mdHolamon       from './exercises/practica_holamon_odoo.md?raw'
import mdGit           from './exercises/practica_git_odoo.md?raw'
import mdRelacionals   from './exercises/practica_fields_relacionals.md?raw'
import mdComputed      from './exercises/practica_fields_computed.md?raw'
import mdConstrains    from './exercises/practica_constrains.md?raw'
import mdXml           from './exercises/practica_xml.md?raw'
import mdViews         from './exercises/practica_views.md?raw'
import mdKanban        from './exercises/practica_kanban.md?raw'
import mdSearch        from './exercises/practica_search.md?raw'
import mdHerencia      from './exercises/practica_herencia.md?raw'
import mdOrm           from './exercises/practica_orm.md?raw'
import mdReport        from './exercises/practica_report.md?raw'
import mdWebControllers from './exercises/practica_web_controllers.md?raw'
import mdNotebook      from './exercises/practica_notebook.md?raw'
import mdAi            from './exercises/practica_ai.md?raw'

/** Ordre fix per data de creació. Afegeix noves entrades al final. */
const ORDERED_SLUGS = [
  ['practica_instalar_odoo',      mdInstalar],
  ['practica_holamon_odoo',       mdHolamon],
  ['practica_git_odoo',           mdGit],
  ['practica_fields_relacionals', mdRelacionals],
  ['practica_fields_computed',    mdComputed],
  ['practica_constrains',         mdConstrains],
  ['practica_xml',                mdXml],
  ['practica_views',              mdViews],
  ['practica_kanban',             mdKanban],
  ['practica_search',             mdSearch],
  ['practica_herencia',           mdHerencia],
  ['practica_orm',                mdOrm],
  ['practica_report',             mdReport],
  ['practica_web_controllers',    mdWebControllers],
  ['practica_notebook',           mdNotebook],
  ['practica_ai',                 mdAi],
]

const state = {
  nia:        localStorage.getItem('odoo-nia') ?? '',
  niaName:    localStorage.getItem('odoo-nia-name') ?? '',
  niaError:   '',
  common:     loadStorage('odoo-common-form', {}),
  byExercise: loadStorage('odoo-exercise-form', {}),
  results:    {},      // slug → Array<{ title, status, detail }>
  professorPassword: sessionStorage.getItem('odoo-professor-password') ?? '',
  professorAuthError: '',
  professorReport: null,
  professorLoading: false,
  professorError: '',
  activities: [],
  activitiesLoaded: false,
  professorActivities: [],
  activitiesLoading: false,
  activitiesError: '',
  isRunning:  false,
}

const practices = ORDERED_SLUGS.map(([slug, content]) => ({
  slug,
  title:   extractTitle(content) ?? slug.replace(/_/g, ' '),
  content,
}))

function normalizeStatus(status) {
  const normalized = String(status ?? '').trim().toLowerCase()
  if (normalized === 'ok' || normalized === 'pass' || normalized === 'passed' || normalized === 'success') return 'ok'
  if (normalized === 'warn' || normalized === 'warning' || normalized === 'partial' || normalized === 'parcial') return 'warn'
  if (normalized === 'fail' || normalized === 'failed' || normalized === 'error' || normalized === 'ko') return 'fail'
  return 'fail'
}

function normalizeResultEntry(entry, fallbackTitle = '') {
  if (!entry || typeof entry !== 'object') {
    return {
      title: fallbackTitle,
      status: 'fail',
      detail: 'Resultat invàlid retornat per la validació.',
    }
  }

  return {
    title: typeof entry.title === 'string' ? entry.title : fallbackTitle,
    status: normalizeStatus(entry.status),
    detail: typeof entry.detail === 'string' ? entry.detail : '',
  }
}

function normalizeResultsArray(results = [], testTitles = []) {
  if (!Array.isArray(results)) return []
  return results.map((entry, index) => normalizeResultEntry(entry, testTitles[index] ?? 'Prova'))
}

export function mountApp(rootElement) {
  if (!location.hash || (!getCurrentPractice() && getRouteSlug() !== 'professor')) {
    location.hash = `#/${practices[0]?.slug ?? ''}`
  }

  window.addEventListener('hashchange', render)
  rootElement.addEventListener('submit', onSubmit)
  rootElement.addEventListener('input', onInput)
  rootElement.addEventListener('click', onSegmentClick)
  rootElement.addEventListener('click', onChangeNia)
  rootElement.addEventListener('click', onProfessorActions)

  // If NIA already set, load persisted progress from DB
  if (state.nia) {
    Promise.all([loadProgressFromDb(state.nia), loadVisibleActivities()]).then(render)
  } else {
    loadVisibleActivities().then(render)
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  function render() {
    //console.log("render");
    
    const routeSlug = getRouteSlug()
    if (routeSlug === 'professor') {
      if (!state.professorPassword) {
        rootElement.innerHTML = renderProfessorPasswordGate(state.professorAuthError)
        return
      }
      rootElement.innerHTML = renderProfessorPage({
        report: state.professorReport,
        loading: state.professorLoading,
        error: state.professorError,
        activities: state.professorActivities,
        activitiesLoading: state.activitiesLoading,
        activitiesError: state.activitiesError,
      })
      return
    }

    const visiblePractices = getVisiblePractices()
    const firstVisiblePractice = visiblePractices[0]

    if (state.activitiesLoaded && routeSlug && !visiblePractices.some((item) => item.slug === routeSlug)) {
      if (firstVisiblePractice) {
        location.hash = `#/${firstVisiblePractice.slug}`
      } else {
        rootElement.innerHTML = `
          <div class="min-h-screen bg-[#171d2d] text-gray-300 flex items-center justify-center p-6">
            <div class="max-w-lg w-full rounded-xl border border-[#323a50] bg-[#21283a] p-6 text-center">
              <h2 class="text-lg font-semibold text-gray-100">No hi ha activitats visibles</h2>
              <p class="mt-2 text-sm text-gray-400">El professor ha ocultat totes les pràctiques temporalment.</p>
              <a href="#/professor" class="mt-4 inline-block text-sm text-cyan-300 hover:text-cyan-200 underline">Accés professor</a>
            </div>
          </div>`
      }
      return
    }

    const practice = getCurrentPractice(visiblePractices)
    if (!practice) return

    const exerciseDefinition = EXERCISE_MAP.get(practice.slug)
    const exerciseValues     = state.byExercise[practice.slug] ?? {}
    const specificFields     = exerciseDefinition?.specificFields ?? []
    const results            = state.results[practice.slug] ?? []
    const score              = summarizeResults(results)

    const mergedValues = { ...state.common, ...exerciseValues }
    const baseTests    = createBaseTests(mergedValues)
    const exTests      = exerciseDefinition?.createTests(mergedValues) ?? []
    const testTitles   = [...baseTests, ...exTests].map((t) => t.title)

    
    

    rootElement.innerHTML = renderExercisePage({
      practices: visiblePractices,
      activePractice: practice,
      score,
      commonFields: COMMON_FIELDS,
      commonValues: state.common,
      specificFields,
      exerciseValues,
      results,
      testTitles,
      isRunning: state.isRunning,
      allResults: state.results,
      activities: state.activities,
      nia:      state.nia,
      niaName:  state.niaName,
    })

    // Overlay modal if no NIA
    if (!state.nia) {
      rootElement.insertAdjacentHTML('beforeend', renderNiaModal(state.niaError))
    }

    const clearBtn = rootElement.querySelector('[data-action="clear-results"]')
    clearBtn?.addEventListener('click', () => {
      state.results[practice.slug] = []
      render()
    })
  }

  async function ensureProfessorReport() {
    if (!state.professorPassword) return
    if (state.professorLoading) return
    state.professorLoading = true
    state.professorError = ''
    render()
    try {
      state.professorReport = await fetchProfessorReport(practices.map((item) => item.slug), state.professorPassword)
      state.professorAuthError = ''
    } catch (error) {
      const normalized = normalizeError(error)
      state.professorError = normalized
      if (normalized.includes('401') || normalized.toLowerCase().includes('contrasenya') || normalized.toLowerCase().includes('password')) {
        state.professorPassword = ''
        state.professorReport = null
        sessionStorage.removeItem('odoo-professor-password')
        state.professorAuthError = 'Contrasenya incorrecta.'
      }
    } finally {
      state.professorLoading = false
      render()
    }
  }

  async function loadVisibleActivities() {
    try {
      const visible = await fetchVisibleActivities(practices.map((item) => item.slug))
      const visibleSet = new Set(visible.map((item) => item.slug))
      state.activities = practices
        .filter((practice) => visibleSet.has(practice.slug))
        .map((practice) => ({
          slug: practice.slug,
          title: practice.title,
          is_visible: 1,
        }))
      state.activitiesLoaded = true
    } catch {
      state.activitiesLoaded = false
      state.activities = []
    }
  }

  async function ensureProfessorActivities() {
    if (!state.professorPassword) return
    state.activitiesLoading = true
    state.activitiesError = ''
    render()
    try {
      const rows = await fetchProfessorActivities(practices.map((item) => item.slug), state.professorPassword)
      const rowBySlug = new Map(rows.map((row) => [row.slug, row]))
      state.professorActivities = practices.map((practice) => ({
        slug: practice.slug,
        title: practice.title,
        is_visible: rowBySlug.get(practice.slug)?.is_visible ?? 1,
      }))
    } catch (error) {
      state.activitiesError = normalizeError(error)
    } finally {
      state.activitiesLoading = false
      render()
    }
  }

  // ─── Submit ──────────────────────────────────────────────────────────────

  async function onSubmit(event) {
    event.preventDefault()

    if (event.target.closest('[data-role="professor-auth-form"]')) {
      const form = event.target.closest('[data-role="professor-auth-form"]')
      const password = form.querySelector('[name="professorPassword"]')?.value?.trim() ?? ''
      if (!password.trim()) {
        state.professorAuthError = 'Introdueix la contrasenya.'
        render()
        return
      }
      state.professorPassword = password
      sessionStorage.setItem('odoo-professor-password', password)
      state.professorAuthError = ''
      await Promise.all([ensureProfessorReport(), ensureProfessorActivities()])
      return
    }

    // ── NIA form ──────────────────────────────────────────────────────────
    if (event.target.closest('[data-role="nia-form"]')) {
      const form = event.target.closest('[data-role="nia-form"]')
      const nia  = form.querySelector('[name="nia"]')?.value?.trim().toUpperCase()
      const name = form.querySelector('[name="name"]')?.value?.trim() ?? ''

      if (!nia) {
        state.niaError = 'El NIA no pot estar buit.'
        render()
        return
      }

      try {
        const student = await identify(nia, name)
        state.nia      = student.nia
        state.niaName  = student.name ?? name
        state.niaError = ''
        localStorage.setItem('odoo-nia', state.nia)
        localStorage.setItem('odoo-nia-name', state.niaName)

        await loadProgressFromDb(state.nia)
        render()
      } catch (err) {
        state.niaError = `Error de connexió amb el servidor: ${err.message}`
        render()
      }
      return
    }

    // ── Exercise form ────────────────────────────────────────────────────
    if (!event.target.closest('form[data-role="exercise-form"]')) return

    const practice = getCurrentPractice()
    if (!practice || state.isRunning) return

    state.isRunning = true
    render()

    const values = {
      ...state.common,
      ...(state.byExercise[practice.slug] ?? {}),
    }

    const results = await runValidation(practice.slug, values)
    state.results[practice.slug] = results
    state.isRunning = false
    render()

    // Auto-save to DB if NIA is set
    if (state.nia) {
      const score = summarizeResults(results)
      saveProgress(state.nia, practice.slug, results, score).catch(() => {})
    }
  }

  // ─── Input ───────────────────────────────────────────────────────────────

  function onInput(event) {
    const target = event.target
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return
    const scope = target.dataset.scope
    const key   = target.dataset.key
    if (!scope || !key) return

    if (scope === 'common') {
      state.common[key] = target.value
      saveStorage('odoo-common-form', state.common)
      return
    }

    const practice = getCurrentPractice()
    if (!practice) return

    state.byExercise[practice.slug] = {
      ...(state.byExercise[practice.slug] ?? {}),
      [key]: target.value,
    }
    saveStorage('odoo-exercise-form', state.byExercise)
  }

  // ─── Segment click (progress bar) ────────────────────────────────────────

  function onSegmentClick(event) {
    const seg = event.target.closest('[data-seg-idx]')
    if (!seg) return

    const errorDisplay = rootElement.querySelector('#seg-error-display')
    if (!errorDisplay) return

    rootElement.querySelectorAll('[data-seg-idx]').forEach((s) => s.classList.remove('ring-2', 'ring-white/30'))

    const detail = seg.dataset.segDetail
    const title  = seg.dataset.segTitle
    const status = seg.dataset.segStatus

    if (detail) {
      seg.classList.add('ring-2', 'ring-white/30')
      errorDisplay.textContent = `[${title}] ${detail}`
      const palette = status === 'ok'
        ? 'bg-green-950/40 border-green-900/50 text-green-400'
        : status === 'warn'
        ? 'bg-yellow-950/40 border-yellow-900/50 text-yellow-400'
        : 'bg-red-950/40 border-red-900/50 text-red-400'
      errorDisplay.className = `mt-2 p-2 rounded text-xs font-mono border ${palette}`
    } else {
      errorDisplay.textContent = ''
      errorDisplay.className   = 'hidden mt-2 p-2 rounded text-xs font-mono border'
    }
  }

  // ─── Change NIA button ───────────────────────────────────────────────────

  function onChangeNia(event) {
    if (!event.target.closest('[data-action="change-nia"]')) return
    state.nia      = ''
    state.niaName  = ''
    state.niaError = ''
    localStorage.removeItem('odoo-nia')
    localStorage.removeItem('odoo-nia-name')
    render()
  }

  function onProfessorActions(event) {
    if (event.target.closest('[data-action="refresh-professor"]')) {
      ensureProfessorReport()
      return
    }
    if (event.target.closest('[data-action="professor-logout"]')) {
      state.professorPassword = ''
      state.professorAuthError = ''
      state.professorReport = null
      sessionStorage.removeItem('odoo-professor-password')
      render()
      return
    }
    if (event.target.closest('[data-action="export-csv"]')) {
      exportProfessorCsv()
      return
    }
    if (event.target.closest('[data-action="refresh-activities"]')) {
      ensureProfessorActivities()
      return
    }

    const toggleBtn = event.target.closest('[data-action="toggle-activity"]')
    if (toggleBtn) {
      const slug = toggleBtn.dataset.slug
      const currentlyVisible = toggleBtn.dataset.visible === '1'
      setProfessorActivityVisibility(slug, !currentlyVisible, state.professorPassword)
        .then(() => Promise.all([ensureProfessorActivities(), loadVisibleActivities()]))
        .catch((error) => {
          state.activitiesError = normalizeError(error)
          render()
        })
      return
    }
  }

  function exportProfessorCsv() {
    const report = state.professorReport
    if (!report) return

    const slugs = report.slugs ?? []
    const rows = report.rows ?? []
    const headers = ['nia', 'name', ...slugs, 'finalGrade']

    const csvLines = [headers.join(',')]
    for (const row of rows) {
      const values = [
        row.nia,
        row.name ?? '',
        ...slugs.map((slug) => {
          const cell = row.exercises?.[slug]
          if (!cell) return ''
          return `${cell.pct.toFixed(2)}% (${cell.ok}/${cell.total})`
        }),
        `${(row.finalGrade ?? 0).toFixed(2)}%`,
      ].map(csvEscape)
      csvLines.push(values.join(','))
    }

    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `informe_profesor_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  function csvEscape(value) {
    const text = String(value ?? '')
    if (!/[",\n]/.test(text)) return text
    return `"${text.replace(/"/g, '""')}"`
  }

  if (getRouteSlug() === 'professor') {
    Promise.all([ensureProfessorReport(), ensureProfessorActivities()])
  }

  window.addEventListener('hashchange', () => {
    if (getRouteSlug() === 'professor') {
      Promise.all([ensureProfessorReport(), ensureProfessorActivities()])
    } else {
      loadVisibleActivities().then(render)
    }
  })
}

// ─── Helpers (module-level) ───────────────────────────────────────────────

async function loadProgressFromDb(nia) {
  try {
    const rows = await fetchProgress(nia)
    for (const row of rows) {
      state.results[row.slug] = normalizeResultsArray(row.results)
    }
  } catch {
    // Silently ignore — server may not be running in dev without backend
  }
}

async function runValidation(slug, values) {
  const exerciseDefinition = EXERCISE_MAP.get(slug)
  const tests   = [...createBaseTests(values), ...(exerciseDefinition?.createTests(values) ?? [])]
  const results = []

  for (const test of tests) {
    try {
      const output = await test.run()
      results.push(normalizeResultEntry({ title: test.title, status: output?.status, detail: output?.detail }, test.title))
    } catch (error) {
      results.push({ title: test.title, status: 'fail', detail: normalizeError(error) })
    }
  }

  return normalizeResultsArray(results, tests.map((test) => test.title))
}

function getVisiblePractices() {
  if (!state.activitiesLoaded) return practices
  const visibleSlugs = new Set(state.activities.map((activity) => activity.slug))
  return practices.filter((item) => visibleSlugs.has(item.slug))
}

function getCurrentPractice(practicesList = practices) {
  const slug = getRouteSlug()
  return practicesList.find((item) => item.slug === slug)
}

function getRouteSlug() {
  return location.hash.replace(/^#\/?/, '').trim()
}
