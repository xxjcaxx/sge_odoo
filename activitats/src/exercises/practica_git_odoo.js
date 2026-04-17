import { createExercise } from './createExercise'
import { fail, normalizeBaseUrl, ok, proxyHttp } from '../services/odooClient'

export const exercise = createExercise({
  slug: 'practica_git_odoo',
  specificFields: [{ key: 'docModel', label: 'Model per validar /doc', type: 'text', placeholder: 'model.practica' }],
  createTests: (values) => [
    {
      title: 'Documentació /doc del model',
      run: async () => {
        const model = values.docModel || values.modelName || 'model.practica'
        const response = await proxyHttp(`${normalizeBaseUrl(values.odooUrl)}/doc/${model}`, { method: 'GET' })
        return response.ok ? ok(`La ruta /doc/${model} respon correctament.`) : fail(`No s'ha pogut validar /doc/${model}. HTTP ${response.status}.`)
      },
    },
  ],
})
