import { createExercise } from './createExercise'
import { fail, json2, ok, warn } from '../services/odooClient'

export const exercise = createExercise({
  slug: 'practica_fields_relacionals',
  specificFields: [
    { key: 'stadiumCity', label: 'Ciutat dels estadis (filtre domain)', type: 'text', placeholder: 'València' },
  ],
  createTests: (values) => [
    {
      title: 'Model basquet.equip existeix',
      run: async () => {
        const data = await json2(values, 'basquet.equip', 'fields_get', {})
        return data ? ok('basquet.equip respon.') : fail('No hi ha metadades de basquet.equip.')
      },
    },
    {
      title: 'Model basquet.jugador existeix',
      run: async () => {
        const data = await json2(values, 'basquet.jugador', 'fields_get', {})
        return data ? ok('basquet.jugador respon.') : fail('No hi ha metadades de basquet.jugador.')
      },
    },
    {
      title: 'Model basquet.pavello existeix',
      run: async () => {
        const data = await json2(values, 'basquet.pavello', 'fields_get', {})
        return data ? ok('basquet.pavello respon.') : fail('No hi ha metadades de basquet.pavello.')
      },
    },
    {
      title: 'Camp jugador_ids de basquet.equip és one2many',
      run: async () => {
        const data = await json2(values, 'basquet.equip', 'fields_get', {})
        const f = data?.jugador_ids
        if (!f) return fail('No existeix jugador_ids a basquet.equip.')
        return f.type === 'one2many' ? ok('jugador_ids és one2many correctament.') : fail(`jugador_ids té tipus ${f.type}, hauria de ser one2many.`)
      },
    },
    {
      title: 'Camp equips_rivals_ids de basquet.equip és many2many',
      run: async () => {
        const data = await json2(values, 'basquet.equip', 'fields_get', {})
        const f = data?.equips_rivals_ids
        if (!f) return fail('No existeix equips_rivals_ids a basquet.equip.')
        return f.type === 'many2many' ? ok('equips_rivals_ids és many2many correctament.') : fail(`equips_rivals_ids té tipus ${f.type}.`)
      },
    },
    {
      title: 'Camp equips_agermanats_ids de basquet.equip és many2many',
      run: async () => {
        const data = await json2(values, 'basquet.equip', 'fields_get', {})
        const f = data?.equips_agermanats_ids
        if (!f) return fail('No existeix equips_agermanats_ids a basquet.equip.')
        return f.type === 'many2many' ? ok('equips_agermanats_ids és many2many correctament.') : fail(`equips_agermanats_ids té tipus ${f.type}.`)
      },
    },
    {
      title: 'Camp estadi_nom de basquet.jugador és related (char/text)',
      run: async () => {
        const data = await json2(values, 'basquet.jugador', 'fields_get', {})
        const f = data?.estadi_nom
        if (!f) return fail('No existeix estadi_nom a basquet.jugador.')
        return f.related ? ok(`estadi_nom és related (${f.related}).`) : warn('estadi_nom existeix però no s\'ha pogut confirmar que siga related.')
      },
    },
    {
      title: 'Related estadi_nom s\'emplena en consultar jugador amb equip',
      run: async () => {
        const data = await json2(values, 'basquet.jugador', 'search_read', {
          domain: [['equip_id', '!=', false]],
          fields: ['name', 'estadi_nom', 'equip_id'],
          limit: 3,
        })
        const recs = Array.isArray(data) ? data : []
        if (!recs.length) return warn('Sense jugadors amb equip assignat per verificar estadi_nom.')
        const filled = recs.filter((r) => r.estadi_nom)
        return filled.length > 0
          ? ok(`estadi_nom omplert en ${filled.length}/${recs.length} jugadors consultats.`)
          : fail('estadi_nom buit per a tots els jugadors amb equip — el Related no funciona.')
      },
    },
  ],
})
