import { marked } from 'marked'
import { escapeHtml } from '../utils/helpers'

// ─── Status helpers ────────────────────────────────────────────────────────────

const SEG_COLOR = {
  ok:      'bg-emerald-400',
  warn:    'bg-amber-300',
  fail:    'bg-rose-400',
  pending: 'bg-[#3a435d]',
}

const SEG_LABEL = { ok: 'OK', warn: 'WARN', fail: 'FAIL', pending: '' }

/** Aggregate status across a results array for sidebar badge */
function aggregateStatus(results) {
  if (!results || !results.length) return 'pending'
  if (results.some((r) => r.status === 'fail')) return 'fail'
  if (results.some((r) => r.status === 'warn')) return 'warn'
  return 'ok'
}

// ─── Progress header ───────────────────────────────────────────────────────────

function renderProgressHeader({ activePractice, results, testTitles, isRunning, score, nia, niaName }) {
  const total = testTitles.length
  const passed = results.filter((r) => r.status === 'ok').length
  const failed = results.filter((r) => r.status === 'fail').length
  const warned = results.filter((r) => r.status === 'warn').length
  const done   = results.length

  const segments = testTitles.map((title, i) => {
    const result  = results[i]
    const status  = result?.status ?? 'pending'
    const detail  = result?.detail ?? ''
    const color   = SEG_COLOR[status]
    const cursor  = status === 'pending' ? 'cursor-default' : 'cursor-pointer'
    return `
      <div
        class="test-segment flex-1 h-full ${color} ${cursor} rounded-sm relative group"
        data-seg-idx="${i}"
        data-seg-title="${escapeHtml(title)}"
        data-seg-detail="${escapeHtml(detail)}"
        data-seg-status="${status}"
        title="${escapeHtml(title)}"
      >
        <div class="
          hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2
          px-2 py-1 bg-gray-900 text-white text-[10px] rounded whitespace-nowrap
          z-50 pointer-events-none border border-gray-700 shadow-xl
        ">
          <span class="font-semibold">[${SEG_LABEL[status] || i + 1}]</span> ${escapeHtml(title)}
        </div>
      </div>`
  }).join('')

  const runningSpinner = isRunning
    ? `<span class="inline-flex items-center gap-1 text-blue-400">
        <svg class="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        Executant...
       </span>`
    : ''

  return `
    <header class="bg-[#242b3d] border-b border-[#323a50] z-10 shrink-0 shadow-[0_8px_20px_rgba(0,0,0,0.25)]" data-purpose="progress-header">
      <div class="w-full px-4 py-2">
        <div class="flex items-center justify-between mb-2 gap-4">
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
            ${escapeHtml(activePractice.title)}
          </span>
          <div class="flex items-center gap-3 shrink-0">
            ${runningSpinner}
            ${!isRunning && done > 0 ? `<span class="text-xs text-gray-400">${score}</span>` : ''}
            ${!isRunning && done === 0 ? `<span class="text-xs text-gray-500">${total} proves pendents</span>` : ''}
            ${nia ? `
              <span class="inline-flex items-center gap-1.5 text-xs text-blue-300 bg-blue-500/10 border border-blue-800 rounded px-2 py-0.5">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                ${escapeHtml(niaName || nia)}
              </span>
              <a href="#/professor" class="text-[10px] text-gray-500 hover:text-gray-300 underline transition-colors">professor</a>
              <button data-action="change-nia" class="text-[10px] text-gray-500 hover:text-gray-300 underline transition-colors">canviar</button>
            ` : ''}
          </div>
        </div>
        <div class="flex gap-0.5 h-3 w-full rounded overflow-hidden border border-[#3b455f] bg-[#1b2132]" data-purpose="granular-progress-bar">
          ${total ? segments : `<div class="flex-1 h-full bg-slate-800 rounded-sm"></div>`}
        </div>
        <div
          class="hidden mt-2 p-2 bg-red-950/40 border border-red-900/50 rounded text-xs text-red-400 font-mono"
          id="seg-error-display"
        ></div>
      </div>
    </header>`
}

// ─── Sidebar ───────────────────────────────────────────────────────────────────

function sidebarStatusIcon(status) {
  if (status === 'ok')   return `<svg class="w-4 h-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>`
  if (status === 'warn') return `<svg class="w-4 h-4 text-yellow-400 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>`
  if (status === 'fail') return `<svg class="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>`
  return `<svg class="w-4 h-4 text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke-width="2"></circle></svg>`
}

function renderSidebar({ practices, activePractice, allResults }) {
  const items = practices.map((item, idx) => {
    const status  = aggregateStatus(allResults[item.slug])
    const isActive = item.slug === activePractice.slug
    const num = String(idx + 1).padStart(2, '0')
    if (isActive) {
      return `
        <li>
          <a href="#/${item.slug}" class="flex items-center p-3 rounded-lg bg-[#242b3d] text-cyan-300 border-l-4 border-cyan-400 gap-2 shadow-[inset_0_-2px_0_#f05ca0]">
            <span class="w-6 text-sm font-bold shrink-0">${num}</span>
            <span class="flex-1 text-sm font-bold truncate">${escapeHtml(item.title)}</span>
            <span class="text-[10px] bg-cyan-400/20 px-1.5 py-0.5 rounded text-cyan-300 shrink-0 uppercase">actiu</span>
          </a>
        </li>`
    }
    return `
      <li>
        <a href="#/${item.slug}" class="flex items-center p-3 rounded-lg text-gray-400 hover:bg-[#242b3d] hover:text-cyan-300 gap-2 transition-colors">
          <span class="w-6 text-sm font-medium shrink-0 ${status === 'pending' ? 'text-gray-600' : ''}">${num}</span>
          <span class="flex-1 text-sm font-medium truncate ${status === 'pending' ? 'text-gray-600' : ''}">${escapeHtml(item.title)}</span>
          ${sidebarStatusIcon(status)}
        </a>
      </li>`
  }).join('')

  return `
    <aside class="w-72 bg-[#1b2132] border-r border-[#313950] flex flex-col shrink-0" data-purpose="sidebar">
      <div class="p-5 border-b border-[#313950]">
        <h2 class="text-lg font-bold text-gray-100 flex items-center gap-2">
          <svg class="w-5 h-5 text-cyan-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          </svg>
          Avaluador Odoo
        </h2>
        <p class="mt-1 text-xs text-gray-500">Pràctiques Odoo · comprovació granular</p>
      </div>
      <nav class="flex-1 overflow-y-auto py-3 px-2">
        <ul class="space-y-0.5">${items}</ul>
      </nav>
    </aside>`
}

// ─── Field renderers ───────────────────────────────────────────────────────────

const INPUT_CLASS = 'block w-full rounded-md border border-[#3a435d] bg-[#161d2d] text-gray-100 text-sm px-3 py-2 placeholder-gray-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none'

function renderField(scope, field, value) {
  if (field.type === 'textarea') {
    return `
      <div>
        <label class="block text-sm font-medium text-gray-400 mb-1" for="${scope}_${field.key}">${escapeHtml(field.label)}</label>
        <textarea
          class="${INPUT_CLASS} min-h-20"
          id="${scope}_${field.key}"
          data-scope="${scope}"
          data-key="${field.key}"
          placeholder="${escapeHtml(field.placeholder ?? '')}"
        >${escapeHtml(value)}</textarea>
      </div>`
  }
  return `
    <div>
      <label class="block text-sm font-medium text-gray-400 mb-1" for="${scope}_${field.key}">${escapeHtml(field.label)}</label>
      <input
        class="${INPUT_CLASS}"
        id="${scope}_${field.key}"
        data-scope="${scope}"
        data-key="${field.key}"
        type="${field.type ?? 'text'}"
        value="${escapeHtml(value)}"
        placeholder="${escapeHtml(field.placeholder ?? '')}"
        ${field.required ? 'required' : ''}
      />
    </div>`
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export function renderExercisePage({
  practices,
  activePractice,
  score,
  commonFields,
  commonValues,
  specificFields,
  exerciseValues,
  results,
  testTitles,
  isRunning,
  allResults,
  activities = [],
  nia = '',
  niaName = '',
  rawOutputs = [],
}) {
  return `
    <div class="h-screen flex flex-col overflow-hidden bg-[#171d2d] text-gray-300">

      ${renderProgressHeader({ activePractice, results, testTitles, isRunning, score, nia, niaName })}

      <div class="flex flex-1 overflow-hidden">

        ${renderSidebar({ practices, activePractice, allResults })}

        <main class="flex-1 overflow-y-auto p-6 space-y-6" data-purpose="main-content">
          <div class="max-w-4xl mx-auto space-y-6">

            <!-- Enunciat -->
            <section class="bg-[#21283a] rounded-xl border border-[#323a50] p-6 shadow-[0_8px_25px_rgba(0,0,0,0.2)]">
              <article class="markdown prose prose-invert prose-blue max-w-none text-gray-400">${marked.parse(activePractice.content)}</article>
            </section>

            <!-- Formulari de validació -->
            <section class="bg-[#21283a] rounded-xl border border-[#323a50] overflow-hidden shadow-[0_8px_25px_rgba(0,0,0,0.2)]">
              <div class="border-b border-[#323a50] px-6 py-4 flex justify-between items-center">
                <h3 class="font-semibold text-gray-200">Dades de validació</h3>
                <span class="text-xs text-gray-500 italic">Comuns + específiques de l'exercici</span>
              </div>
              <form data-role="exercise-form" data-slug="${activePractice.slug}" class="p-6 space-y-5">

                <div class="grid gap-4 md:grid-cols-2">
                  ${commonFields.map((f) => renderField('common', f, commonValues[f.key] ?? '')).join('')}
                </div>

                ${specificFields.length ? `
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Específic de l'exercici</p>
                    <div class="grid gap-4 md:grid-cols-2">
                      ${specificFields.map((f) => renderField('exercise', f, exerciseValues[f.key] ?? '')).join('')}
                    </div>
                  </div>` : ''}

                <div>
                  <label class="block text-sm font-medium text-gray-400 mb-1" for="manualNotes">Notes / Evidències</label>
                  <textarea
                    class="${INPUT_CLASS} min-h-20"
                    id="manualNotes"
                    data-scope="exercise"
                    data-key="manualNotes"
                    placeholder="Enllaços, captures o observacions..."
                  >${escapeHtml(exerciseValues.manualNotes ?? '')}</textarea>
                </div>

                <div class="flex items-center justify-end gap-3 pt-4 border-t border-[#323a50]">
                  <button
                    class="px-4 py-2 text-sm font-medium text-gray-300 bg-transparent border border-[#4a556f] rounded-md hover:border-[#f05ca0] hover:bg-[#2b3248] transition-colors"
                    type="button" data-action="clear-results"
                  >Netejar resultats</button>
                  <button
                    class="px-6 py-2 text-sm font-bold rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-lg text-[#0f1b2c] bg-gradient-to-b from-cyan-300 to-cyan-500 hover:brightness-105 shadow-cyan-900/30"
                    type="submit" ${isRunning ? 'disabled' : ''}
                  >
                    ${isRunning
                      ? `<svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg> Executant...`
                      : `<span>Executar validació</span><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>`
                    }
                  </button>
                </div>
              </form>
            </section>

            ${rawOutputs.length ? `
            <!-- Raw JSON outputs -->
            <section class="bg-[#21283a] rounded-xl border border-[#323a50] overflow-hidden shadow-[0_8px_25px_rgba(0,0,0,0.2)]">
              <div class="border-b border-[#323a50] px-6 py-4 flex justify-between items-center">
                <h3 class="font-semibold text-gray-200">JSON obtingut</h3>
                <span class="text-xs text-gray-500 italic">${rawOutputs.length} respostes</span>
              </div>
              <div class="p-6 space-y-4">
                ${rawOutputs.map((item) => `
                  <div>
                    <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">${escapeHtml(item.title)}</p>
                    ${Array.isArray(item.raw)
                      ? item.raw.map((call) => `
                        <p class="text-[10px] text-gray-600 font-mono mb-0.5">${escapeHtml(call.label)}</p>
                        <pre class="bg-[#161d2d] border border-[#3a435d] rounded-md p-3 text-xs text-green-300 font-mono overflow-auto max-h-64 whitespace-pre break-all mb-2">${escapeHtml(JSON.stringify(call.data, null, 2))}</pre>`).join('')
                      : `<pre class="bg-[#161d2d] border border-[#3a435d] rounded-md p-3 text-xs text-green-300 font-mono overflow-auto max-h-64 whitespace-pre break-all">${escapeHtml(JSON.stringify(item.raw, null, 2))}</pre>`
                    }
                  </div>`).join('')}
              </div>
            </section>` : ''}

          </div>
        </main>

      </div>
    </div>`
}
