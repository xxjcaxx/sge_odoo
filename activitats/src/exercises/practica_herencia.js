import { createExercise } from './createExercise'
import { fail, json2, ok, warn } from '../services/odooClient'

export const exercise = createExercise({
  slug: 'practica_herencia',
  specificFields: [],
  createTests: (values) => [
    {
      title: 'Model restaurant.comanda existeix',
      run: async () => {
        const data = await json2(values, 'restaurant.comanda', 'fields_get', {})
        return data ? ok('restaurant.comanda respon a fields_get.') : fail('No hi ha metadades de restaurant.comanda.')
      },
    },
    {
      title: 'Camp instruccions_lliurament a restaurant.comanda (herència classe)',
      run: async () => {
        const data = await json2(values, 'restaurant.comanda', 'fields_get', {})
        return 'instruccions_lliurament' in (data ?? {})
          ? ok('instruccions_lliurament existeix (herència de classe correcta).')
          : fail('No s\'ha detectat instruccions_lliurament — comprova _inherit sense _name.')
      },
    },
    {
      title: 'Model comanda.urgent existeix (herència prototip)',
      run: async () => {
        const data = await json2(values, 'comanda.urgent', 'fields_get', {})
        return data ? ok('comanda.urgent respon — herència prototip detectada.') : fail('No hi ha metadades de comanda.urgent.')
      },
    },
    {
      title: 'Camp recarrec_urgencia a comanda.urgent',
      run: async () => {
        const data = await json2(values, 'comanda.urgent', 'fields_get', {})
        const campos = data ?? {}
        const found = Object.keys(campos).some((k) => k.includes('recarrec') || k.includes('urgencia') || k.includes('urgència'))
        return found ? ok('Camp de recàrrec d\'urgència detectat.') : fail('No s\'ha detectat cap camp de recàrrec a comanda.urgent.')
      },
    },
    {
      title: 'Model comanda.especial existeix (herència delegació)',
      run: async () => {
        const data = await json2(values, 'comanda.especial', 'fields_get', {})
        return data ? ok('comanda.especial respon — herència per delegació detectada.') : fail('No hi ha metadades de comanda.especial.')
      },
    },
    {
      title: 'Model restaurant.avaluador existeix',
      run: async () => {
        const data = await json2(values, 'restaurant.avaluador', 'fields_get', {})
        return data ? ok('restaurant.avaluador respon.') : fail('No hi ha metadades de restaurant.avaluador.')
      },
    },
    {
      title: 'restaurant.avaluador té registres declarats',
      run: async () => {
        const data = await json2(values, 'restaurant.avaluador', 'search_read', {
          domain: [],
          fields: ['nom_model', 'model_heretat', 'tipus_herencia'],
          limit: 10,
        })
        const recs = Array.isArray(data) ? data : []
        return recs.length > 0
          ? ok(`${recs.length} registres a restaurant.avaluador.`)
          : warn('Cap registre a restaurant.avaluador — recorda afegir-hi les dades.')
      },
    },
    {
      title: 'Prefix URGENT/ al crear comanda urgent',
      run: async () => {
        let createdId = null
        try {
          const create = await json2(values, 'comanda.urgent', 'create', {
            values: { name: 'Test_123', estat: 'esborrany' },
          })
          createdId = create
          if (!createdId) return fail('No ha retornat ID en crear comanda urgent.')
          const read = await json2(values, 'comanda.urgent', 'read', {
            ids: [createdId], fields: ['name'],
          })
          const rec = Array.isArray(read) ? read[0] : null
          const hasPrefix = rec?.name?.startsWith('URGENT/')
          return hasPrefix
            ? ok(`Comanda urgent creada amb name="${rec.name}" — prefix URGENT/ correcte.`)
            : fail(`Name resultant: "${rec?.name}" — falta el prefix URGENT/.`)
        } finally {
          if (createdId) {
            await json2(values, 'comanda.urgent', 'unlink', { ids: [createdId] }).catch(() => {})
          }
        }
      },
    },
    {
      title: 'Acció de comanda.urgent té domain exclòs lliurat',
      run: async () => {
        const data = await json2(values, 'ir.actions.act_window', 'search_read', {
          domain: [['res_model', '=', 'comanda.urgent']],
          fields: ['name', 'domain'],
          limit: 3,
        })
        const actions = Array.isArray(data) ? data : []
        if (!actions.length) return warn('No s\'ha trobat cap acció de finestra per a comanda.urgent.')
        const found = actions.some((a) => (a.domain ?? '').includes('lliurat'))
        return found ? ok('El domain de l\'acció exclou comandes en estat lliurat.') : warn('El domain de l\'acció no sembla filtrar per \'lliurat\' — revisa la configuració.')
      },
    },
  ],
})
