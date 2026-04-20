import { createExercise } from './createExercise'
import { fail, json2, ok, warn } from '../services/odooClient'

const requiredTypes = ['integer', 'char', 'text', 'float', 'boolean', 'date', 'datetime', 'html', 'binary', 'selection']

export const exercise = createExercise({
  slug: 'practica_holamon_odoo',
  specificFields: [{ key: 'selectionField', label: 'Camp selection (nom tècnic)', type: 'text', placeholder: 'x_estat' }],
  createTests: (values) => [
    ...requiredTypes.map((type) => ({
      title: `Tipus requerit: ${type}`,
      run: async () => {
        if (!values.modelName) return warn('Defineix el model principal per validar els fields.')
        const data = await json2(values, values.modelName, 'fields_get', {})
        const fields = Object.values(data ?? {})
        const found = fields.some((field) => field.type === type)
        return found ? ok(`Existeix almenys un camp de tipus ${type}.`) : fail(`No s'ha detectat cap camp de tipus ${type}.`)
      },
    })),
    {
      title: 'Camp selection requerit amb 3 opcions',
      run: async () => {
        if (!values.modelName) return warn('Defineix el model principal per validar els fields.')
        if (!values.selectionField) return warn('Defineix el camp selection a validar.')

        const data = await json2(values, values.modelName, 'fields_get', {})
        const field = data?.[values.selectionField]

        if (!field) return fail(`No existeix cap camp amb nom tècnic ${values.selectionField}.`)
        if (field.type !== 'selection') return fail(`El camp ${values.selectionField} existeix però no és de tipus selection.`)

        const options = Array.isArray(field.selection) ? field.selection : []
        return options.length === 3
          ? ok(`El camp ${values.selectionField} és selection i té exactament 3 opcions.`)
          : fail(`El camp ${values.selectionField} és selection però té ${options.length} opcions (calen 3).`)
      },
    },
    {
      title: 'Almenys 2 camps required',
      run: async () => {
        if (!values.modelName) return warn('Defineix el model principal per validar els fields.')

        const data = await json2(values, values.modelName, 'fields_get', {})
        const fields = Object.values(data ?? {})
        const requiredCount = fields.filter((field) => field?.required === true).length

        return requiredCount >= 2
          ? ok(`S'han detectat ${requiredCount} camps amb required=true.`)
          : fail(`Només s'han detectat ${requiredCount} camps amb required=true (calen almenys 2).`)
      },
    },
    
  ],
    
})
