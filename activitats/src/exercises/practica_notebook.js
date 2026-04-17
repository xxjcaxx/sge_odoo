import { createExercise } from './createExercise'
import { fail, json2, ok, warn } from '../services/odooClient'

export const exercise = createExercise({
  slug: 'practica_notebook',
  specificFields: [
    { key: 'seasonYear', label: 'Any de la temporada a generar (ex: 2025)', type: 'number', placeholder: '2025' },
  ],
  createTests: (values) => [
    {
      title: 'Model lliga.futbol existeix',
      run: async () => {
        const data = await json2(values, 'lliga.futbol', 'fields_get', {})
        return data ? ok('lliga.futbol respon a fields_get.') : fail('No hi ha metadades de lliga.futbol.')
      },
    },
    {
      title: 'Camp classificacio_ids present a lliga.futbol',
      run: async () => {
        const data = await json2(values, 'lliga.futbol', 'fields_get', {})
        return 'classificacio_ids' in (data ?? {})
          ? ok('classificacio_ids existeix.')
          : fail('No s\'ha detectat classificacio_ids a lliga.futbol.')
      },
    },
    {
      title: 'Model lliga.temporada existeix',
      run: async () => {
        const data = await json2(values, 'lliga.temporada', 'fields_get', {})
        return data ? ok('lliga.temporada respon.') : fail('No hi ha metadades de lliga.temporada.')
      },
    },
    {
      title: 'Mètode generar_temporada invocable',
      run: async () => {
        const lligues = await json2(values, 'lliga.futbol', 'search_read', {
          domain: [], fields: ['id', 'name'], limit: 1,
        })
        const llib = Array.isArray(lligues) ? lligues[0] : null
        if (!llib) return warn('No hi ha cap lliga per invocar generar_temporada.')
        const any = parseInt(values.seasonYear ?? '2025', 10)
        try {
          const result = await json2(values, 'lliga.futbol', 'generar_temporada', { ids: [llib.id], any })
          return ok(`generar_temporada ha respost per a la lliga "${llib.name}" (any ${any}).`)
        } catch (e) {
          return fail(`Error invocant generar_temporada: ${e.message}`)
        }
      },
    },
    {
      title: 'Existeix almenys una temporada creada',
      run: async () => {
        const data = await json2(values, 'lliga.temporada', 'search_read', {
          domain: [], fields: ['name', 'lliga_id', 'jornada_ids'], limit: 5,
        })
        const recs = Array.isArray(data) ? data : []
        if (!recs.length) return warn('Sense temporades creades — invoca generar_temporada primer.')
        const withJornades = recs.filter((r) => Array.isArray(r.jornada_ids) && r.jornada_ids.length > 0)
        return withJornades.length > 0
          ? ok(`${recs.length} temporades, ${withJornades.length} amb jornades generades.`)
          : warn(`${recs.length} temporades però sense jornades — comprova que generar_temporada crea les jornades.`)
      },
    },
    {
      title: 'Les jornades contenen partits',
      run: async () => {
        const data = await json2(values, 'lliga.jornada', 'search_read', {
          domain: [], fields: ['name', 'partit_ids'], limit: 3,
        })
        const recs = Array.isArray(data) ? data : []
        if (!recs.length) return warn('Sense jornades per verificar partits.')
        const amb = recs.filter((r) => Array.isArray(r.partit_ids) && r.partit_ids.length > 0)
        return amb.length > 0
          ? ok(`${amb.length}/${recs.length} jornades consultades contenen partits.`)
          : warn('Jornades sense partits — comprova la generació dels enfrontaments.')
      },
    },
  ],
})
