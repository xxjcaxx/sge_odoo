import { createExercise } from './createExercise'
import { fail, json2, ok, warn } from '../services/odooClient'

export const exercise = createExercise({
  slug: 'practica_instalar_odoo',
  specificFields: [
    { key: 'modelName', label: 'Model principal', type: 'text', placeholder: '' },
    { key: 'productName', label: 'Nom producte prova', type: 'text', placeholder: 'Producte_Prova_API o Producte_Prova_API_2026' }],
  createTests: (values) => [
    {
      title: 'Producte de prova existent',
      run: async () => {
        const productName = String(values.productName ?? '').trim()
        const fallbackNames = ['Producte_Prova_API', 'Producte_Prova_API_2026']
        const expectedNames = productName ? [productName] : fallbackNames
        const data = await json2(values, 'product.template', 'search_read', {
          domain: productName
            ? [['name', '=', productName]]
            : [['name', 'in', expectedNames]],
          fields: ['name', 'list_price'],
          limit: 5,
        })
        const rows = Array.isArray(data) ? data : []
        const foundRow = rows.find((row) => expectedNames.includes(String(row?.name ?? '').trim()))

        if (foundRow) {
          return ok(`S'ha trobat ${foundRow.name}.`)
        }

        return warn(`No s'ha trobat cap producte esperat encara: ${expectedNames.join(' o ')}.`)
      },
    },
  ],
})
