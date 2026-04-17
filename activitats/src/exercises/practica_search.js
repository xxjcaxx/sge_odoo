import { createExercise } from './createExercise'
import { json2, ok, warn } from '../services/odooClient'

export const exercise = createExercise({
  slug: 'practica_search',
  specificFields: [{ key: 'viewXmlNeedle', label: 'Text a buscar en XML vista', type: 'text', placeholder: 'filtre_actiu' }],
  createTests: (values) => [
    {
      title: 'Validació de filtre en XML de vista',
      run: async () => {
        const needle = values.viewXmlNeedle || 'filtre_actiu'
        const data = await json2(values, 'ir.ui.view', 'search_read', {
          domain: values.externalId ? [['key', '=', values.externalId]] : [],
          fields: ['name', 'arch', 'key'],
          limit: 10,
        })
        const views = Array.isArray(data) ? data : []
        const found = views.some((view) => (view.arch || '').includes(needle))
        return found ? ok(`S'ha detectat "${needle}" a l'arquitectura XML.`) : warn(`No s'ha detectat "${needle}" en les vistes consultades.`)
      },
    },
  ],
})
