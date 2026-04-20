import { createExercise } from './createExercise'
import { fail, json2, ok, warn } from '../services/odooClient'

function toSingleId(value) {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

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
        let pavelloId = null
        let equipId = null
        let jugadorId = null

        try {
          const stamp = Date.now()
          const city = (values.stadiumCity || 'València').trim()
          const stadiumName = `Pavello test ${stamp}`

          pavelloId = toSingleId(await json2(values, 'basquet.pavello', 'create', {
            values: { name: stadiumName, ciutat: city },
          }))
          if (!pavelloId) return fail('No s\'ha pogut crear basquet.pavello per provar el related.')

          equipId = toSingleId(await json2(values, 'basquet.equip', 'create', {
            values: { name: `Equip test ${stamp}`, ciutat: city, estadi_id: pavelloId },
          }))
          if (!equipId) return fail('No s\'ha pogut crear basquet.equip per provar el related.')

          jugadorId = toSingleId(await json2(values, 'basquet.jugador', 'create', {
            values: { name: `Jugador test ${stamp}`, equip_id: equipId },
          }))
          if (!jugadorId) return fail('No s\'ha pogut crear basquet.jugador per provar el related.')

          const read = await json2(values, 'basquet.jugador', 'read', {
            ids: [jugadorId],
            fields: ['name', 'equip_id', 'estadi_nom'],
          })
          const rec = Array.isArray(read) ? read[0] : null
          const relatedName = rec?.estadi_nom

          return relatedName === stadiumName
            ? ok(`estadi_nom s\'ha omplit correctament amb "${relatedName}".`)
            : fail(`estadi_nom="${relatedName ?? ''}"; s\'esperava "${stadiumName}".`)
        } finally {
          if (jugadorId) await json2(values, 'basquet.jugador', 'unlink', { ids: [jugadorId] }).catch(() => {})
          if (equipId) await json2(values, 'basquet.equip', 'unlink', { ids: [equipId] }).catch(() => {})
          if (pavelloId) await json2(values, 'basquet.pavello', 'unlink', { ids: [pavelloId] }).catch(() => {})
        }
      },
    },
  ],
})
