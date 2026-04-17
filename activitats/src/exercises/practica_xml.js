import { createExercise } from './createExercise'
import { fail, json2, ok, warn } from '../services/odooClient'

const REQUISITS = ['img', 'ref', 'dat', 'm2m']
const LABELS = { img: 'Imatge', ref: 'Referència', dat: 'Data Calculada', m2m: 'Relació Many2many' }

export const exercise = createExercise({
  slug: 'practica_xml',
  specificFields: [],
  createTests: (values) => [
    {
      title: 'Model rpg.avaluador existeix',
      run: async () => {
        const data = await json2(values, 'rpg.avaluador', 'fields_get', {})
        return data ? ok('rpg.avaluador respon a fields_get.') : fail('No hi ha metadades de rpg.avaluador.')
      },
    },
    {
      title: 'Camps nom_model, ext_id i requisit a rpg.avaluador',
      run: async () => {
        const data = await json2(values, 'rpg.avaluador', 'fields_get', {})
        const fields = data ?? {}
        const missing = ['nom_model', 'ext_id', 'requisit'].filter((k) => !(k in fields))
        return missing.length === 0
          ? ok('Els tres camps obligatoris estan presents.')
          : fail(`Camps que falten a rpg.avaluador: ${missing.join(', ')}.`)
      },
    },
    {
      title: 'camp requisit és Selection amb 4 opcions',
      run: async () => {
        const data = await json2(values, 'rpg.avaluador', 'fields_get', {})
        const f = data?.requisit
        if (!f) return fail('El camp requisit no existeix.')
        if (f.type !== 'selection') return fail(`requisit és ${f.type}, ha de ser selection.`)
        const opts = (f.selection ?? []).map(([k]) => k)
        const missing = REQUISITS.filter((r) => !opts.includes(r))
        return missing.length === 0
          ? ok(`Selection té les 4 opcions: ${REQUISITS.join(', ')}.`)
          : fail(`Falten opcions al selection: ${missing.join(', ')}.`)
      },
    },
    {
      title: 'Hi ha exactament 4 registres (un per requisit)',
      run: async () => {
        const data = await json2(values, 'rpg.avaluador', 'search_read', {
          domain: [], fields: ['nom_model', 'ext_id', 'requisit'], limit: 10,
        })
        const recs = Array.isArray(data) ? data : []
        const covered = recs.map((r) => r.requisit)
        const missing = REQUISITS.filter((r) => !covered.includes(r))
        if (recs.length === 0) return fail('Cap registre a rpg.avaluador — afegeix els 4 registres de control als demo data.')
        return missing.length === 0
          ? ok(`${recs.length} registres, els 4 requisits presents.`)
          : warn(`Hi ha ${recs.length} registres però falten: ${missing.map((k) => LABELS[k]).join(', ')}.`)
      },
    },
    ...REQUISITS.map((req) => ({
      title: `Registre "${LABELS[req]}" (${req}) té ext_id i nom_model`,
      run: async () => {
        const data = await json2(values, 'rpg.avaluador', 'search_read', {
          domain: [['requisit', '=', req]], fields: ['nom_model', 'ext_id'], limit: 1,
        })
        const rec = Array.isArray(data) ? data[0] : null
        if (!rec) return fail(`No hi ha registre amb requisit=${req}.`)
        if (!rec.ext_id) return fail(`El registre ${req} no té ext_id definit.`)
        if (!rec.nom_model) return fail(`El registre ${req} no té nom_model definit.`)
        return ok(`${req}: ext_id="${rec.ext_id}", nom_model="${rec.nom_model}".`)
      },
    })),
    {
      title: 'Validació imatge: el registre img té dades en base64',
      run: async () => {
        const data = await json2(values, 'rpg.avaluador', 'search_read', {
          domain: [['requisit', '=', 'img']], fields: ['nom_model', 'ext_id'], limit: 1,
        })
        const rec = Array.isArray(data) ? data[0] : null
        if (!rec?.nom_model) return warn('Sense registre img per validar la imatge.')
        const img = await json2(values, rec.nom_model, 'search_read', {
          domain: [], fields: ['image', 'image_1920'], limit: 1,
        })
        const imgRec = Array.isArray(img) ? img[0] : null
        const b64 = imgRec?.image || imgRec?.image_1920
        return b64 ? ok('La imatge té contingut base64.') : warn('No s\'ha trobat contingut base64 en el camp image — revisa el fitxer de dades XML.')
      },
    },
    {
      title: 'Validació data: el registre dat té data al passat',
      run: async () => {
        const data = await json2(values, 'rpg.avaluador', 'search_read', {
          domain: [['requisit', '=', 'dat']], fields: ['nom_model', 'ext_id'], limit: 1,
        })
        const rec = Array.isArray(data) ? data[0] : null
        if (!rec?.nom_model) return warn('Sense registre dat per validar la data calculada.')
        const modelData = await json2(values, rec.nom_model, 'search_read', {
          domain: [], fields: ['create_date', 'date', 'data_creacio'], limit: 1,
        })
        const mRec = Array.isArray(modelData) ? modelData[0] : null
        const dateVal = mRec?.date || mRec?.data_creacio || mRec?.create_date
        if (!dateVal) return warn('No s\'ha pogut verificar el camp de data — comprova el nom del camp de data al model.')
        const parsed = new Date(dateVal)
        return parsed < new Date()
          ? ok(`Data al passat: ${dateVal}.`)
          : warn(`Data trobada (${dateVal}) no és al passat — comprova l\'expressió eval.`)
      },
    },
    {
      title: 'Validació m2m: el registre m2m té habilitats vinculades',
      run: async () => {
        const data = await json2(values, 'rpg.avaluador', 'search_read', {
          domain: [['requisit', '=', 'm2m']], fields: ['nom_model', 'ext_id'], limit: 1,
        })
        const rec = Array.isArray(data) ? data[0] : null
        if (!rec?.nom_model) return warn('Sense registre m2m per validar la relació.')
        const modelFields = await json2(values, rec.nom_model, 'fields_get', {})
        const m2mFields = Object.entries(modelFields ?? {}).filter(([, f]) => f.type === 'many2many')
        if (!m2mFields.length) return fail(`Cap camp many2many al model ${rec.nom_model}.`)
        const [fieldKey] = m2mFields[0]
        const modelData = await json2(values, rec.nom_model, 'search_read', {
          domain: [[fieldKey, '!=', false]], fields: [fieldKey], limit: 1,
        })
        const mRec = Array.isArray(modelData) ? modelData[0] : null
        const ids = mRec?.[fieldKey]
        return Array.isArray(ids) && ids.length > 0
          ? ok(`Many2many "${fieldKey}" conté ${ids.length} relació/ns al registre de prova.`)
          : warn(`Camp ${fieldKey} existeix però sense relacions M2M carregades — revisa la tripleta (0,0,{...}) al XML.`)
      },
    },
  ],
})
