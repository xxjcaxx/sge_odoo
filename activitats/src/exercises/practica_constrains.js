import { createExercise } from './createExercise'
import { fail, json2, ok, warn } from '../services/odooClient'

export const exercise = createExercise({
  slug: 'practica_constrains',
  specificFields: [
    { key: 'existingNif', label: 'NIF alumne ja existent (test unicitat)', type: 'text', placeholder: '12345678A' },
  ],
  createTests: (values) => [
    {
      title: 'Model matricula.alumne existeix',
      run: async () => {
        const data = await json2(values, 'matricula.alumne', 'fields_get', {})
        return data ? ok('El model matricula.alumne respon a fields_get.') : fail('No hi ha metadades de matricula.alumne.')
      },
    },
    {
      title: 'Model matricula.curs existeix',
      run: async () => {
        const data = await json2(values, 'matricula.curs', 'fields_get', {})
        return data ? ok('El model matricula.curs respon.') : fail('No hi ha metadades de matricula.curs.')
      },
    },
    {
      title: 'Model matricula.inscripcio existeix',
      run: async () => {
        const data = await json2(values, 'matricula.inscripcio', 'fields_get', {})
        return data ? ok('El model matricula.inscripcio respon.') : fail('No hi ha metadades de matricula.inscripcio.')
      },
    },
    {
      title: 'Camp nif present a matricula.alumne',
      run: async () => {
        const data = await json2(values, 'matricula.alumne', 'fields_get', {})
        return 'nif' in (data ?? {})
          ? ok('El camp nif existeix.')
          : fail('No s\'ha detectat el camp nif a matricula.alumne.')
      },
    },
    {
      title: 'Camp alumne_elegible_ids és computat store=False',
      run: async () => {
        const data = await json2(values, 'matricula.inscripcio', 'fields_get', {})
        const field = data?.alumne_elegible_ids
        if (!field) return fail('No existeix el camp alumne_elegible_ids.')
        return field.store === false
          ? ok('Existeix com a Many2many computat (store=False).')
          : warn('Existeix però store no és False; comprova que no s\'emmagatzema a BD.')
      },
    },
    {
      title: 'Restricció SQL: NIF duplicat ha de fallar',
      run: async () => {
        if (!values.existingNif) return warn('Introdueix un NIF ja existent per provar la unicitat SQL.')
        try {
          await json2(values, 'matricula.alumne', 'create', { values: { name: 'Test dup', nif: values.existingNif, edat: 20 } })
          return fail('La creació amb NIF duplicat no ha llançat error — restricció SQL no activa.')
        } catch {
          return ok('NIF duplicat ha generat error correctament (restricció SQL activa).')
        }
      },
    },
    {
      title: 'Restricció Python: data_fi < data_inici ha de fallar',
      run: async () => {
        try {
          await json2(values, 'matricula.curs', 'create', {
            values: { name: 'Test dates', data_inici: '2030-06-01', data_fi: '2030-01-01', capacitat_maxima: 10 },
          })
          return fail('Dates incoherents acceptades — @api.constrains no actiu.')
        } catch {
          return ok('Dates incoherents han generat ValidationError correctament.')
        }
      },
    },
    {
      title: 'Restricció SQL: capacitat_maxima = 0 ha de fallar',
      run: async () => {
        try {
          await json2(values, 'matricula.curs', 'create', {
            values: { name: 'Test cap', data_inici: '2030-01-01', data_fi: '2030-06-01', capacitat_maxima: 0 },
          })
          return fail('Capacitat 0 acceptada sense error — restricció SQL no activa.')
        } catch {
          return ok('Capacitat ≤ 0 ha generat error correctament.')
        }
      },
    },
    {
      title: 'Vista form de inscripcio usa alumne_elegible_ids com a domain',
      run: async () => {
        const data = await json2(values, 'ir.ui.view', 'search_read', {
          domain: [['model', '=', 'matricula.inscripcio'], ['type', '=', 'form']],
          fields: ['arch'],
          limit: 5,
        })
        const views = Array.isArray(data) ? data : []
        const found = views.some((v) => (v.arch ?? '').includes('alumne_elegible_ids'))
        return found
          ? ok('El domain d\'alumne_id referencia alumne_elegible_ids al XML.')
          : warn('No s\'ha detectat alumne_elegible_ids al XML de cap vista form de matricula.inscripcio.')
      },
    },
  ],
})
