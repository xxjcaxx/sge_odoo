import { createExercise } from './createExercise'
import { fail, json2, ok, warn } from '../services/odooClient'

const MODELS = ['rpg.personatge', 'rpg.classe', 'rpg.missio', 'rpg.habilitat']

const REQUIRED_WIDGETS = [
  { name: 'image', model: 'rpg.personatge' },
  { name: 'progressbar', model: 'rpg.personatge' },
  { name: 'ribbon', model: 'rpg.personatge' },
  { name: 'many2many_tags', model: 'rpg.personatge' },
]

const REQUIRED_XML_TOKENS = [
  { token: '<notebook', label: '<notebook> al form de personatge', model: 'rpg.personatge', type: 'form' },
  { token: '<sheet', label: '<sheet> al form de personatge', model: 'rpg.personatge', type: 'form' },
  { token: 'decoration-danger', label: 'decoration-danger a algun list', model: null, type: 'list' },
  { token: 'invisible', label: 'Condició invisible en algun camp', model: 'rpg.personatge', type: 'form' },
  { token: 'readonly', label: 'Condició readonly en algun camp', model: 'rpg.personatge', type: 'form' },
]

export const exercise = createExercise({
  slug: 'practica_views',
  specificFields: [],
  createTests: (values) => [
    ...MODELS.map((model) => ({
      title: `Model ${model} existeix`,
      run: async () => {
        const data = await json2(values, model, 'fields_get', {})
        return data ? ok(`${model} respon a fields_get.`) : fail(`No hi ha metadades de ${model}.`)
      },
    })),

    ...REQUIRED_WIDGETS.map(({ name, model }) => ({
      title: `Widget "${name}" al form de ${model}`,
      run: async () => {
        const data = await json2(values, 'ir.ui.view', 'search_read', {
          domain: [['model', '=', model], ['type', '=', 'form']],
          fields: ['arch'],
          limit: 5,
        })
        const views = Array.isArray(data) ? data : []
        const found = views.some((v) => (v.arch ?? '').includes(`widget="${name}"`))
        return found ? ok(`widget="${name}" detectat al form de ${model}.`) : fail(`No s\'ha detectat widget="${name}" al form de ${model}.`)
      },
    })),

    ...REQUIRED_XML_TOKENS.map(({ token, label, model, type }) => ({
      title: `${label}`,
      run: async () => {
        const domain = [['type', '=', type]]
        if (model) domain.push(['model', '=', model])
        const data = await json2(values, 'ir.ui.view', 'search_read', { domain, fields: ['arch'], limit: 10 })
        const views = Array.isArray(data) ? data : []
        const found = views.some((v) => (v.arch ?? '').includes(token))
        return found ? ok(`"${token}" detectat.`) : fail(`No s\'ha detectat "${token}" a les vistes.`)
      },
    })),

    {
      title: 'default_order en alguna vista list',
      run: async () => {
        const data = await json2(values, 'ir.ui.view', 'search_read', {
          domain: [['type', '=', 'list'], ['model', 'in', MODELS]],
          fields: ['arch'],
          limit: 10,
        })
        const views = Array.isArray(data) ? data : []
        const found = views.some((v) => (v.arch ?? '').includes('default_order'))
        return found ? ok('default_order detectat en alguna vista list.') : warn('No s\'ha detectat default_order en cap vista list — comprova que almenys una llista ordena per defecte.')
      },
    },

    {
      title: 'Vista list editable (editable="top" o "bottom")',
      run: async () => {
        const data = await json2(values, 'ir.ui.view', 'search_read', {
          domain: [['type', '=', 'list'], ['model', 'in', MODELS]],
          fields: ['arch'],
          limit: 10,
        })
        const views = Array.isArray(data) ? data : []
        const found = views.some((v) => /editable="(top|bottom)"/.test(v.arch ?? ''))
        return found ? ok('Vista list editable detectada.') : warn('Cap vista list amb editable="top/bottom" — revisa rpg.classe.')
      },
    },

    {
      title: 'Accions de finestra per a tots els models',
      run: async () => {
        const data = await json2(values, 'ir.actions.act_window', 'search_read', {
          domain: [['res_model', 'in', MODELS]],
          fields: ['res_model'],
          limit: 20,
        })
        const actions = Array.isArray(data) ? data : []
        const covered = [...new Set(actions.map((a) => a.res_model))]
        const missing = MODELS.filter((m) => !covered.includes(m))
        return missing.length === 0
          ? ok(`Accions de finestra per a tots els models (${MODELS.length}).`)
          : warn(`Models sense acció de finestra: ${missing.join(', ')}.`)
      },
    },
  ],
})
