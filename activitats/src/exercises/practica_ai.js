import { createExercise } from './createExercise'
import { fail, json2, normalizeBaseUrl, ok, proxyHttp, warn } from '../services/odooClient'

export const exercise = createExercise({
  slug: 'practica_ai',
  specificFields: [
    { key: 'ollamaUrl', label: 'URL Ollama (remot IES)', type: 'url', placeholder: 'http://ollama-ies:11434' },
    { key: 'rpgModel', label: 'Model rpg.personatge (si difereix)', type: 'text', placeholder: 'rpg.personatge' },
  ],
  createTests: (values) => [
    {
      title: 'Connectivitat a Ollama',
      run: async () => {
        if (!values.ollamaUrl) return warn('Introdueix la URL de l\'Ollama remot de l\'IES.')
        const resp = await proxyHttp(`${normalizeBaseUrl(values.ollamaUrl)}/api/tags`, { method: 'GET' }).catch(() => null)
        if (!resp) return fail('No s\'ha pogut connectar a Ollama — comprova la URL i que el port 11434 és accessible.')
        return resp.ok ? ok('Ollama respon a /api/tags correctament.') : fail(`Ollama ha respost HTTP ${resp.status}.`)
      },
    },
    {
      title: 'Model rpg.personatge existeix a Odoo',
      run: async () => {
        const model = values.rpgModel || 'rpg.personatge'
        const data = await json2(values, model, 'fields_get', {})
        return data ? ok(`${model} respon a fields_get.`) : fail(`No hi ha metadades de ${model}.`)
      },
    },
    {
      title: 'Wizard de xat (TransientModel) existeix',
      run: async () => {
        const wizard = await json2(values, 'ir.model', 'search_read', {
          domain: [['transient', '=', true], ['model', 'like', 'rpg']],
          fields: ['model', 'transient'],
          limit: 5,
        })
        const recs = Array.isArray(wizard) ? wizard : []
        return recs.length > 0
          ? ok(`${recs.length} TransientModel relacionat amb rpg: ${recs.map((r) => r.model).join(', ')}.`)
          : warn('Cap TransientModel amb nom rpg detectat — crea el Wizard de xat.')
      },
    },
    {
      title: 'Mòdul rpg_ai_master instal·lat',
      run: async () => {
        const data = await json2(values, 'ir.module.module', 'search_read', {
          domain: [['name', '=', 'rpg_ai_master'], ['state', '=', 'installed']],
          fields: ['name', 'state'],
          limit: 1,
        })
        const recs = Array.isArray(data) ? data : []
        return recs.length > 0 ? ok('rpg_ai_master instal·lat correctament.') : fail('rpg_ai_master no detectat com a instal·lat — instal·la el mòdul primer.')
      },
    },
    {
      title: 'Autenticació amb API Key a JSON-2 (necessari per a MCP)',
      run: async () => {
        if (!values.apiKey) return warn('No hi ha API Key — imprescindible per a la tasca MCP.')
        const data = await json2(values, 'res.users', 'search_read', { fields: ['id', 'name'], limit: 1 })
        const count = Array.isArray(data) ? data.length : 0
        return count > 0 ? ok('API Key vàlida per a les cridades autenticades del MCP.') : fail('L\'API Key no ha retornat usuaris — recrea-la des de la configuració d\'Odoo.')
      },
    },
  ],
})
