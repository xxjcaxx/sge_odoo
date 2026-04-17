import { escapeHtml } from '../utils/helpers'

/**
 * Renders the NIA identification modal overlay.
 * Emits no events directly — the app.js submit handler reads data-role="nia-form".
 */
export function renderNiaModal(errorMessage = '') {
  return `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      data-role="nia-modal"
    >
      <div class="bg-[#1e293b] border border-gray-700 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-8">

        <div class="mb-6 text-center">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-500/20 mb-4">
            <svg class="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <h2 class="text-xl font-bold text-gray-100">Identificació</h2>
          <p class="mt-1 text-sm text-gray-400">
            Introdueix el teu NIA per guardar el teu progrés
          </p>
        </div>

        <form data-role="nia-form" class="space-y-4">

          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1" for="nia-input">NIA</label>
            <input
              id="nia-input"
              name="nia"
              type="text"
              autocomplete="off"
              placeholder="Ex: 12345678"
              autofocus
              class="block w-full rounded-md border border-gray-700 bg-[#0f172a] text-gray-100 text-sm px-3 py-2.5
                     placeholder-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none
                     text-center tracking-widest text-lg font-bold uppercase"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1" for="nia-name">Nom (opcional)</label>
            <input
              id="nia-name"
              name="name"
              type="text"
              autocomplete="name"
              placeholder="El teu nom complet"
              class="block w-full rounded-md border border-gray-700 bg-[#0f172a] text-gray-100 text-sm px-3 py-2
                     placeholder-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          ${errorMessage ? `
            <p class="text-sm text-red-400 bg-red-950/40 border border-red-900/50 rounded px-3 py-2">
              ${escapeHtml(errorMessage)}
            </p>` : ''}

          <button
            type="submit"
            class="w-full py-2.5 text-sm font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700
                   transition-colors shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            Entrar
          </button>

        </form>
      </div>
    </div>`
}
