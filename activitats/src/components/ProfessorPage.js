import { escapeHtml } from '../utils/helpers'

export function renderProfessorPasswordGate(error = '') {
  return `
    <div class="h-screen bg-[#171d2d] text-gray-300 flex items-center justify-center p-4">
      <div class="w-full max-w-md bg-[#21283a] border border-[#323a50] rounded-xl p-6 shadow-[0_8px_25px_rgba(0,0,0,0.25)]">
        <h1 class="text-lg font-bold text-gray-100">Accés professor</h1>
        <p class="mt-1 text-sm text-gray-400">Introdueix la contrasenya per veure el panell d'alumnes.</p>
        <form data-role="professor-auth-form" class="mt-4 space-y-3">
          <div>
            <label class="block text-sm text-gray-400 mb-1" for="professorPassword">Contrasenya</label>
            <input id="professorPassword" name="professorPassword" type="password" required autocomplete="current-password" class="block w-full rounded-md border border-[#3a435d] bg-[#161d2d] text-gray-100 px-3 py-2 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none" />
          </div>
          ${error ? `<p class="text-sm text-red-400">${escapeHtml(error)}</p>` : ''}
          <div class="flex items-center justify-between gap-2">
            <a href="#/practica_instalar_odoo" class="px-3 py-1.5 rounded border border-gray-700 text-xs text-gray-300 hover:bg-gray-800 transition-colors">Tornar</a>
            <button type="submit" class="px-3 py-1.5 rounded text-xs text-[#0f1b2c] bg-gradient-to-b from-cyan-300 to-cyan-500 hover:brightness-105 transition-colors">Entrar</button>
          </div>
        </form>
      </div>
    </div>
  `
}

function formatPercent(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-'
  return `${value.toFixed(1)}%`
}

function gradeColor(grade) {
  if (grade >= 80) return 'text-green-400'
  if (grade >= 50) return 'text-yellow-300'
  return 'text-red-400'
}

export function renderProfessorPage({ report, loading, error, activities = [], activitiesLoading = false, activitiesError = '' }) {
  const slugs = report?.slugs ?? []
  const rows = report?.rows ?? []

  const studentsTotal = rows.length
  const allCells = rows.flatMap((row) => slugs.map((slug) => row.exercises?.[slug]).filter(Boolean))
  const evaluatedCells = allCells.filter((cell) => (cell.total ?? 0) > 0)
  const okCells = evaluatedCells.filter((cell) => cell.pct >= 80).length
  const warnCells = evaluatedCells.filter((cell) => cell.pct >= 50 && cell.pct < 80).length
  const failCells = evaluatedCells.filter((cell) => cell.pct < 50).length

  const evaluatedStudents = rows.filter((row) =>
    slugs.some((slug) => (row.exercises?.[slug]?.total ?? 0) > 0),
  ).length

  const exerciseDoneCounts = Object.fromEntries(
    slugs.map((slug) => [
      slug,
      rows.filter((row) => (row.exercises?.[slug]?.total ?? 0) > 0).length,
    ]),
  )

  return `
    <div class="h-screen overflow-hidden bg-[#171d2d] text-gray-300 flex flex-col">
      <header class="bg-[#242b3d] border-b border-[#323a50] px-4 py-3 shadow-[0_8px_20px_rgba(0,0,0,0.25)]">
        <div class="max-w-[1400px] mx-auto flex items-center justify-between gap-3">
          <div>
            <h1 class="text-lg font-bold text-gray-100">Panel del Profesor</h1>
            <p class="text-xs text-gray-400">Consecución por alumno y nota global basada en tests</p>
          </div>
          <div class="flex items-center gap-2">
            <a href="#/practica_instalar_odoo" class="px-3 py-1.5 rounded border border-gray-700 text-xs text-gray-300 hover:bg-gray-800 transition-colors">Volver a ejercicios</a>
            <button data-action="refresh-professor" class="px-3 py-1.5 rounded border border-gray-700 text-xs text-gray-300 hover:bg-gray-800 transition-colors">Actualizar</button>
            <button data-action="export-csv" class="px-3 py-1.5 rounded text-xs text-[#0f1b2c] bg-gradient-to-b from-cyan-300 to-cyan-500 hover:brightness-105 transition-colors">Exportar CSV</button>
            <button data-action="professor-logout" class="px-3 py-1.5 rounded border border-gray-700 text-xs text-gray-300 hover:bg-gray-800 transition-colors">Cerrar sesión</button>
          </div>
        </div>

        <div class="max-w-[1400px] mx-auto mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span class="px-2.5 py-1 rounded border border-[#3b455f] bg-[#1b2132] text-gray-300">
            Alumnos: <strong class="text-gray-100">${studentsTotal}</strong>
          </span>
          <span class="px-2.5 py-1 rounded border border-[#3b455f] bg-[#1b2132] text-gray-300">
            Activos: <strong class="text-gray-100">${evaluatedStudents}</strong>
          </span>
          <span class="px-2.5 py-1 rounded border border-[#3b455f] bg-[#1b2132] text-gray-300">
            Ejercicios evaluados: <strong class="text-gray-100">${evaluatedCells.length}</strong>
          </span>

          <span class="ml-1 px-2.5 py-1 rounded border border-emerald-700/40 bg-emerald-500/10 text-emerald-300">
            OK: <strong>${okCells}</strong>
          </span>
          <span class="px-2.5 py-1 rounded border border-amber-700/40 bg-amber-500/10 text-amber-300">
            WARN: <strong>${warnCells}</strong>
          </span>
          <span class="px-2.5 py-1 rounded border border-rose-700/40 bg-rose-500/10 text-rose-300">
            FAIL: <strong>${failCells}</strong>
          </span>
        </div>
      </header>

      <main class="flex-1 overflow-auto p-4">
        <div class="max-w-[1400px] mx-auto space-y-4">
          <div class="bg-[#21283a] border border-[#323a50] rounded-xl overflow-hidden shadow-[0_8px_25px_rgba(0,0,0,0.2)]">
          ${loading ? '<div class="p-6 text-sm text-gray-400">Cargando informe...</div>' : ''}
          ${error ? `<div class="p-6 text-sm text-red-400">${escapeHtml(error)}</div>` : ''}

          ${!loading && !error ? `
            <div class="overflow-auto">
              <table class="min-w-full text-sm">
                <thead class="bg-[#242b3d] border-b border-[#323a50] sticky top-0 z-10">
                  <tr>
                    <th class="sticky left-0 z-20 bg-[#242b3d] px-3 py-2 text-left text-xs uppercase tracking-wide text-gray-400 whitespace-nowrap" style="min-width: 8rem; width: 8rem;">NIA</th>
                    <th class="sticky z-20 bg-[#242b3d] px-3 py-2 text-left text-xs uppercase tracking-wide text-gray-400 whitespace-nowrap" style="left: 8rem; min-width: 14rem; width: 14rem;">Alumno</th>
                    ${slugs.map((slug) => `<th class="px-3 py-2 text-center text-[10px] uppercase tracking-wide text-gray-400 whitespace-nowrap">${escapeHtml(slug.replace('practica_', ''))}<span class="ml-1 text-[10px] text-cyan-300">(${exerciseDoneCounts[slug] ?? 0})</span></th>`).join('')}
                    <th class="sticky right-0 z-20 bg-[#242b3d] px-3 py-2 text-center text-xs uppercase tracking-wide text-gray-400 whitespace-nowrap" style="min-width: 8rem; width: 8rem;">Nota final</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows.length === 0 ? `
                    <tr><td colspan="${slugs.length + 3}" class="px-3 py-6 text-center text-gray-500">No hay alumnos con datos todavía.</td></tr>
                  ` : rows.map((row) => `
                    <tr class="group border-b border-[#323a50] hover:bg-[#242b3d]">
                      <td class="sticky left-0 z-10 bg-[#21283a] group-hover:bg-[#242b3d] px-3 py-2 font-semibold text-gray-200 whitespace-nowrap" style="min-width: 8rem; width: 8rem;">${escapeHtml(row.nia)}</td>
                      <td class="sticky z-10 bg-[#21283a] group-hover:bg-[#242b3d] px-3 py-2 text-gray-300 whitespace-nowrap" style="left: 8rem; min-width: 14rem; width: 14rem;">${escapeHtml(row.name || '-')}</td>
                      ${slugs.map((slug) => {
                        const cell = row.exercises?.[slug]
                        if (!cell) return '<td class="px-2 py-2 text-center text-gray-600">-</td>'
                        const cls = cell.pct >= 80 ? 'text-green-400' : cell.pct >= 50 ? 'text-yellow-300' : 'text-red-400'
                        return `<td class="px-2 py-2 text-center whitespace-nowrap ${cls}" title="${cell.ok}/${cell.total} tests">${formatPercent(cell.pct)}</td>`
                      }).join('')}
                      <td class="sticky right-0 z-10 bg-[#21283a] group-hover:bg-[#242b3d] px-3 py-2 text-center font-bold whitespace-nowrap ${gradeColor(row.finalGrade)}" style="min-width: 8rem; width: 8rem;">${formatPercent(row.finalGrade)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}
          </div>

          <section class="bg-[#21283a] border border-[#323a50] rounded-xl p-4 shadow-[0_8px_25px_rgba(0,0,0,0.2)]">
            <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
              <h2 class="text-sm font-semibold text-gray-200 uppercase tracking-wide">Gestor d'activitats visibles</h2>
              <button data-action="refresh-activities" class="px-3 py-1.5 rounded border border-gray-700 text-xs text-gray-300 hover:bg-gray-800 transition-colors">Recarregar</button>
            </div>

            <div class="rounded-lg border border-[#323a50] overflow-hidden">
              ${activitiesLoading ? '<div class="p-3 text-sm text-gray-400">Carregant activitats...</div>' : ''}
              ${activitiesError ? `<div class="p-3 text-sm text-red-400">${escapeHtml(activitiesError)}</div>` : ''}
              ${!activitiesLoading && !activitiesError ? `
                <table class="min-w-full text-sm">
                  <thead class="bg-[#242b3d] border-b border-[#323a50]">
                    <tr>
                      <th class="px-3 py-2 text-left text-xs uppercase tracking-wide text-gray-400">Pràctica</th>
                      <th class="px-3 py-2 text-center text-xs uppercase tracking-wide text-gray-400">Visible</th>
                      <th class="px-3 py-2 text-right text-xs uppercase tracking-wide text-gray-400">Accions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${activities.length === 0 ? `
                      <tr><td colspan="3" class="px-3 py-4 text-center text-gray-500">No hi ha pràctiques per configurar.</td></tr>
                    ` : activities.map((activity) => `
                      <tr class="border-b border-[#323a50] hover:bg-[#242b3d]">
                        <td class="px-3 py-2 text-gray-200">${escapeHtml(activity.title)}</td>
                        <td class="px-3 py-2 text-center">
                          <span class="px-2 py-0.5 rounded text-xs ${activity.is_visible ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-700/40' : 'bg-gray-700/30 text-gray-400 border border-gray-600/40'}">
                            ${activity.is_visible ? 'Sí' : 'No'}
                          </span>
                        </td>
                        <td class="px-3 py-2 text-right">
                          <button data-action="toggle-activity" data-slug="${escapeHtml(activity.slug)}" data-visible="${activity.is_visible ? '1' : '0'}" class="px-2 py-1 rounded border border-gray-700 text-xs text-gray-300 hover:bg-gray-800">${activity.is_visible ? 'Ocultar' : 'Mostrar'}</button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              ` : ''}
            </div>
          </section>
        </div>
      </main>
    </div>
  `
}
