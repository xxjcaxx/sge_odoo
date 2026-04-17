import { createExercise } from './createExercise'
import { fail, json2, ok, warn } from '../services/odooClient'

const requiredTypes = ['integer', 'char', 'text', 'float', 'boolean', 'date', 'datetime', 'html', 'binary', 'image', 'selection']

export const exercise = createExercise({
  slug: 'practica_holamon_odoo',
  specificFields: [{ key: 'selectionField', label: 'Camp selection (nom tècnic)', type: 'text', placeholder: 'x_estat' }],
  createTests: (values) =>
    requiredTypes.map((type) => ({
      title: `Tipus requerit: ${type}`,
      run: async () => {
        if (!values.modelName) return warn('Defineix el model principal per validar els fields.')
        const data = await json2(values, values.modelName, 'fields_get', {})
        const fields = Object.values(data ?? {})
        const found = fields.some((field) => field.type === type)
        return found ? ok(`Existeix almenys un camp de tipus ${type}.`) : fail(`No s'ha detectat cap camp de tipus ${type}.`)
      },
    })),
})
