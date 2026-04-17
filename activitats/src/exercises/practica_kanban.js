import { createExercise } from './createExercise'
import { fail, json2, ok, warn } from '../services/odooClient'

export const exercise = createExercise({
  slug: 'practica_kanban',
  specificFields: [],
  createTests: (values) => [
    {
      title: 'Model rpg.personatge existeix',
      run: async () => {
        const data = await json2(values, 'rpg.personatge', 'fields_get', {})
        return data ? ok('rpg.personatge respon a fields_get.') : fail('No hi ha metadades de rpg.personatge.')
      },
    },
    {
      title: 'Camps bàsics: name, nivell, classe, descripcio, color, image',
      run: async () => {
        const data = await json2(values, 'rpg.personatge', 'fields_get', {})
        const fields = data ?? {}
        const required = ['name', 'nivell', 'classe', 'descripcio', 'color', 'image']
        const missing = required.filter((k) => !(k in fields))
        return missing.length === 0
          ? ok('Tots els camps bàsics de la carta estan presents.')
          : fail(`Camps que falten: ${missing.join(', ')}.`)
      },
    },
    {
      title: 'nivell és Integer',
      run: async () => {
        const data = await json2(values, 'rpg.personatge', 'fields_get', {})
        const f = data?.nivell
        if (!f) return fail('Camp nivell no trobat.')
        return f.type === 'integer' ? ok('nivell és Integer.') : fail(`nivell té tipus ${f.type}, hauria de ser integer.`)
      },
    },
    {
      title: 'classe és Selection',
      run: async () => {
        const data = await json2(values, 'rpg.personatge', 'fields_get', {})
        const f = data?.classe
        if (!f) return fail('Camp classe no trobat.')
        return f.type === 'selection' ? ok(`classe és Selection amb ${(f.selection ?? []).length} opcions.`) : fail(`classe té tipus ${f.type}.`)
      },
    },
    {
      title: 'Existeix vista Kanban per a rpg.personatge',
      run: async () => {
        const data = await json2(values, 'ir.ui.view', 'search_read', {
          domain: [['model', '=', 'rpg.personatge'], ['type', '=', 'kanban']],
          fields: ['name', 'arch'],
          limit: 5,
        })
        const views = Array.isArray(data) ? data : []
        if (!views.length) return fail('No s\'ha detectat cap vista kanban per a rpg.personatge.')
        const hasCard = views.some((v) => (v.arch ?? '').includes('kanban-box') || (v.arch ?? '').includes('kanban_image'))
        return hasCard ? ok('Vista kanban detectada amb estructura de carta (kanban-box/kanban_image).') : warn('Vista kanban present però sense kanban-box ni kanban_image.')
      },
    },
    {
      title: 'Model rpg.gremi existeix',
      run: async () => {
        const data = await json2(values, 'rpg.gremi', 'fields_get', {})
        return data ? ok('rpg.gremi respon — model de gremi creat.') : fail('No hi ha metadades de rpg.gremi.')
      },
    },
    {
      title: 'Acció de finestra per defecte és Kanban',
      run: async () => {
        const data = await json2(values, 'ir.actions.act_window', 'search_read', {
          domain: [['res_model', '=', 'rpg.personatge']],
          fields: ['name', 'view_mode'],
          limit: 3,
        })
        const actions = Array.isArray(data) ? data : []
        if (!actions.length) return warn('Cap acció de finestra per a rpg.personatge.')
        const hasKanban = actions.some((a) => (a.view_mode ?? '').startsWith('kanban'))
        return hasKanban ? ok('L\'acció de finestra comença pels Kanban (view_mode té kanban primer).') : warn(`view_mode trobat: "${actions[0]?.view_mode}" — kanban ha d\'aparèixer primer.`)
      },
    },
    {
      title: 'Almenys 4 personatges creats amb imatge',
      run: async () => {
        const data = await json2(values, 'rpg.personatge', 'search_read', {
          domain: [['image', '!=', false]],
          fields: ['name', 'classe', 'nivell'],
          limit: 10,
        })
        const recs = Array.isArray(data) ? data : []
        return recs.length >= 4
          ? ok(`${recs.length} personatges amb imatge detectats.`)
          : fail(`Sols ${recs.length} personatge/s amb imatge — cal almenys 4.`)
      },
    },
  ],
})
