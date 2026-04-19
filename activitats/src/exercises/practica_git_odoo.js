import { createExercise } from './createExercise'
import { fail, normalizeBaseUrl, ok, proxyHttp } from '../services/odooClient'

function firstUrlFromText(text = '') {
  const match = String(text).match(/https?:\/\/[^\s)]+/i)
  return match?.[0] ?? ''
}

function resolveRepositoryUrl(values) {
  return String(values.repoUrl || values.repositoryUrl || firstUrlFromText(values.manualNotes) || '').trim()
}

function normalizeRepositoryUrl(url = '') {
  return String(url)
    .trim()
    .replace(/\.git$/i, '')
    .replace(/\/$/, '')
}

function parseGithubRepo(url = '') {
  const m = normalizeRepositoryUrl(url).match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)$/i)
  if (!m) return null
  return { owner: m[1], repo: m[2] }
}

async function repositoryExists(repoUrl) {
  const resp = await proxyHttp(repoUrl, { method: 'GET' })
  return resp.ok ? ok('El repositori públic és accessible.') : fail(`No s\'ha pogut accedir al repositori. HTTP ${resp.status}.`)
}

async function repositoryHasRequiredStructure(repoUrl) {
  const gh = parseGithubRepo(repoUrl)
  if (!gh) {
    const addonsCandidates = [
      `${repoUrl}/tree/main/addons`,
      `${repoUrl}/tree/master/addons`,
      `${repoUrl}/-/tree/main/addons`,
      `${repoUrl}/-/tree/master/addons`,
    ]
    const moduleCandidates = [
      `${repoUrl}/tree/main/addons/practica_git_sge`,
      `${repoUrl}/tree/master/addons/practica_git_sge`,
      `${repoUrl}/-/tree/main/addons/practica_git_sge`,
      `${repoUrl}/-/tree/master/addons/practica_git_sge`,
    ]
    const addonsChecks = await Promise.all(addonsCandidates.map((url) => proxyHttp(url, { method: 'GET' }).then((r) => r.ok).catch(() => false)))
    const moduleChecks = await Promise.all(moduleCandidates.map((url) => proxyHttp(url, { method: 'GET' }).then((r) => r.ok).catch(() => false)))
    const addonsOk = addonsChecks.some(Boolean)
    const moduleOk = moduleChecks.some(Boolean)

    if (addonsOk && moduleOk) {
      return ok('S\'ha detectat l\'estructura addons/practica_git_sge al repositori.')
    }
    return fail('No s\'ha pogut validar l\'estructura addons/practica_git_sge al repositori.')
  }

  const apiAddons = `https://api.github.com/repos/${gh.owner}/${gh.repo}/contents/addons`
  const apiModule = `https://api.github.com/repos/${gh.owner}/${gh.repo}/contents/addons/practica_git_sge`

  const addonsResp = await proxyHttp(apiAddons, { method: 'GET', headers: { Accept: 'application/vnd.github+json' } })
  if (!addonsResp.ok) return fail(`No s\'ha detectat la carpeta addons al repositori (HTTP ${addonsResp.status}).`)

  const moduleResp = await proxyHttp(apiModule, { method: 'GET', headers: { Accept: 'application/vnd.github+json' } })
  if (!moduleResp.ok) return fail(`No s\'ha detectat addons/practica_git_sge (HTTP ${moduleResp.status}).`)

  return ok('Estructura correcta: addons/practica_git_sge.')
}

export const exercise = createExercise({
  slug: 'practica_git_odoo',
  specificFields: [
    { key: 'repoUrl', label: 'URL del repositori públic', type: 'url', placeholder: 'https://github.com/usuari/repo' },
    { key: 'docModel', label: 'Model per validar /doc', type: 'text', placeholder: 'practica_git_sge.practica' },
  ],
  createTests: (values) => [
    {
      title: 'Existeix el repositori públic indicat',
      run: async () => {
        const repoUrl = normalizeRepositoryUrl(resolveRepositoryUrl(values))
        if (!repoUrl) return fail('Falta la URL del repositori públic (camp específic o Notes / Evidències).')
        return repositoryExists(repoUrl)
      },
    },
    {
      title: 'Estructura del repositori (addons/practica_git_sge)',
      run: async () => {
        const repoUrl = normalizeRepositoryUrl(resolveRepositoryUrl(values))
        if (!repoUrl) return fail('Falta la URL del repositori públic per validar l\'estructura.')
        return repositoryHasRequiredStructure(repoUrl)
      },
    },
    {
      title: 'Documentació /doc del model',
      run: async () => {
        const model = values.docModel || values.modelName || 'practica_git_sge.practica'
        const response = await proxyHttp(`${normalizeBaseUrl(values.odooUrl)}/doc/${model}`, { method: 'GET' })
        return response.ok ? ok(`La ruta /doc/${model} respon correctament.`) : fail(`No s'ha pogut validar /doc/${model}. HTTP ${response.status}.`)
      },
    },
  ],
})
