import { createExercise } from './createExercise'
import { fail, json2, ok, warn } from '../services/odooClient'

export const exercise = createExercise({
  slug: 'practica_orm',
  specificFields: [],
  createTests: (values) => [
    {
      title: 'Model exc2.deck existeix',
      run: async () => {
        const data = await json2(values, 'exc2.deck', 'fields_get', {})
        return data ? ok('exc2.deck respon a fields_get.') : fail('No hi ha metadades de exc2.deck.')
      },
    },
    {
      title: 'Model exc2.card existeix',
      run: async () => {
        const data = await json2(values, 'exc2.card', 'fields_get', {})
        return data ? ok('exc2.card respon.') : fail('No hi ha metadades de exc2.card.')
      },
    },
    {
      title: 'exc2.deck té relació one2many cap a exc2.card',
      run: async () => {
        const data = await json2(values, 'exc2.deck', 'fields_get', {})
        const fields = data ?? {}
        const o2m = Object.values(fields).find((f) => f.type === 'one2many' && (f.relation === 'exc2.card' || f.relation?.includes('card')))
        return o2m ? ok(`Relació one2many detectada: ${JSON.stringify(o2m.relation)}.`) : fail('No s\'ha detectat cap relació one2many cap a exc2.card.')
      },
    },
    {
      title: 'create() genera exactament 48 cartes',
      run: async () => {
        let deckId = null
        try {
          const create = await json2(values, 'exc2.deck', 'create', { values: { name: 'Test Deck ORM' } })
          deckId = create
          if (!deckId) return fail('No ha retornat ID en crear exc2.deck.')
          const read = await json2(values, 'exc2.deck', 'read', { ids: [deckId], fields: ['name', 'card_ids'] })
          const deck = Array.isArray(read) ? read[0] : null
          const count = Array.isArray(deck?.card_ids) ? deck.card_ids.length : 0
          return count === 48
            ? ok(`create() ha generat exactament 48 cartes correctament.`)
            : fail(`S\'han generat ${count} cartes — s\'esperaven 48.`)
        } finally {
          if (deckId) await json2(values, 'exc2.deck', 'unlink', { ids: [deckId] }).catch(() => {})
        }
      },
    },
    {
      title: 'Mètode obtenir_cartes_premium existeix i és invocable',
      run: async () => {
        const decks = await json2(values, 'exc2.deck', 'search_read', { domain: [], fields: ['id'], limit: 1 })
        const recs = Array.isArray(decks) ? decks : []
        if (!recs.length) return warn('Sense baralles per invocar obtenir_cartes_premium.')
        try {
          const result = await json2(values, 'exc2.deck', 'obtenir_cartes_premium', { ids: [recs[0].id] })
          return Array.isArray(result)
            ? ok(`obtenir_cartes_premium ha retornat ${result.length} cartes de cors (♥).`)
            : warn(`obtenir_cartes_premium ha respost però no ha retornat un array.`)
        } catch (e) {
          return fail(`Error invocant obtenir_cartes_premium: ${e.message}`)
        }
      },
    },
    {
      title: 'Mètode merge_hands existeix i és invocable',
      run: async () => {
        const decks = await json2(values, 'exc2.deck', 'search_read', { domain: [], fields: ['id', 'card_ids'], limit: 1 })
        const d = Array.isArray(decks) ? decks[0] : null
        if (!d || !d.card_ids?.length) return warn('Sense baralla ni cartes per provar merge_hands.')
        const ids = d.card_ids.slice(0, 4)
        try {
          await json2(values, 'exc2.card', 'merge_hands', { ids, op: '|' })
          return ok('merge_hands invocable sense errors.')
        } catch (e) {
          return fail(`Error invocant merge_hands: ${e.message}`)
        }
      },
    },
  ],
})
