import { createExercise } from './createExercise'
import { fail, json2, ok, warn } from '../services/odooClient'

const REQUIRED_FIELDS = [
  { key: 'preu_final',            check: (f) => f.type === 'float' && f.store === true,   hint: 'Ha de ser float i store=True.' },
  { key: 'codi_seguretat',         check: (f) => f.type === 'char',                         hint: 'Ha de ser char computed.' },
  { key: 'data_limit_acces',       check: (f) => f.type === 'datetime',                     hint: 'Ha de ser datetime computed.' },
  { key: 'foto_comprador',         check: (f) => f.type === 'binary' || f.type === 'image', hint: 'Ha de ser image o binary computed.' },
  { key: 'clausules_legals',       check: (f) => f.type === 'html',                         hint: 'Ha de ser html computed.' },
  { key: 'etiquetes_ids',          check: (f) => f.type === 'many2many',                    hint: 'Ha de ser many2many.' },
  { key: 'entrades_relacionades_ids', check: (f) => f.type === 'many2many',                 hint: 'Ha de ser many2many computed.' },
  { key: 'comprador_id',           check: (f) => f.type === 'many2one',                     hint: 'Ha de ser many2one cap a res.partner.' },
]

export const exercise = createExercise({
  slug: 'practica_fields_computed',
  specificFields: [],
  createTests: (values) => [
    {
      title: 'Model entrades.tiquet existeix',
      run: async () => {
        const data = await json2(values, 'entrades.tiquet', 'fields_get', {})
        return data ? ok('El model entrades.tiquet respon a fields_get.') : fail('No hi ha metadades d\'entrades.tiquet.')
      },
    },
    {
      title: 'Model entrades.esdeveniment existeix',
      run: async () => {
        const data = await json2(values, 'entrades.esdeveniment', 'fields_get', {})
        return data ? ok('El model entrades.esdeveniment respon.') : fail('No hi ha metadades d\'entrades.esdeveniment.')
      },
    },
    ...REQUIRED_FIELDS.map(({ key, check, hint }) => ({
      title: `Camp ${key} — tipus i atributs correctes`,
      run: async () => {
        const data = await json2(values, 'entrades.tiquet', 'fields_get', {})
        const field = data?.[key]
        if (!field) return fail(`No s\'ha detectat el camp ${key}.`)
        return check(field) ? ok(`${key} té el tipus i atributs correctes.`) : warn(`${key} existeix però ${hint}`)
      },
    })),
    {
      title: 'preu_final emmagatzemat (store=True) — comprova via search_read',
      run: async () => {
        const data = await json2(values, 'entrades.tiquet', 'search_read', {
          domain: [],
          fields: ['preu_final'],
          limit: 1,
        })
        const records = Array.isArray(data) ? data : []
        if (!records.length) return warn('No hi ha registres a entrades.tiquet per verificar preu_final.')
        return typeof records[0].preu_final === 'number'
          ? ok(`preu_final és un número (${records[0].preu_final}) llegit directament de BD.`)
          : fail('preu_final no retorna un número — possiblement no és store=True.')
      },
    },
    {
      title: 'clausules_legals conté etiquetes HTML <b> o <strong>',
      run: async () => {
        const data = await json2(values, 'entrades.tiquet', 'search_read', {
          domain: [],
          fields: ['clausules_legals'],
          limit: 1,
        })
        const rec = Array.isArray(data) ? data[0] : null
        if (!rec) return warn('Sense registres per comprovar clausules_legals.')
        const html = rec.clausules_legals ?? ''
        return /<b>|<strong>/i.test(html)
          ? ok('clausules_legals conté <b> o <strong> amb el nom del comprador.')
          : fail('clausules_legals no conté <b> ni <strong>.')
      },
    },
    {
      title: 'Vista list de entrades.tiquet té atribut sum a preu_final',
      run: async () => {
        const data = await json2(values, 'ir.ui.view', 'search_read', {
          domain: [['model', '=', 'entrades.tiquet'], ['type', '=', 'list']],
          fields: ['arch'],
          limit: 5,
        })
        const views = Array.isArray(data) ? data : []
        const found = views.some((v) => /preu_final[^>]*sum=/.test(v.arch ?? ''))
        return found ? ok('L\'atribut sum s\'ha detectat a preu_final a la vista list.') : warn('No s\'ha detectat sum="..." a preu_final en cap vista list.')
      },
    },
  ],
})
