import { createExercise } from './createExercise'
import { fail, json2, ok, warn } from '../services/odooClient'

function toSingleId(value) {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

async function getPartnerForComputedTests(values, stamp) {
  const data = await json2(values, 'res.partner', 'search_read', {
    domain: [['name', '!=', false]],
    fields: ['id', 'name'],
    limit: 1,
  })

  const existing = Array.isArray(data) ? data[0] : null
  if (existing?.id && existing?.name) {
    return { partnerId: existing.id, partnerName: existing.name, createdPartnerId: null }
  }

  const partnerName = `Comprador test ${stamp}`
  const createdPartnerId = toSingleId(await json2(values, 'res.partner', 'create', {
    values: { name: partnerName },
  }))

  return { partnerId: createdPartnerId, partnerName, createdPartnerId }
}

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
      title: 'Model venda_entrades_segures.tiquet existeix',
      run: async () => {
        const data = await json2(values, 'venda_entrades_segures.tiquet', 'fields_get', {})
        return data ? ok('El model venda_entrades_segures.tiquet respon a fields_get.') : fail('No hi ha metadades d\'venda_entrades_segures.tiquet.')
      },
    },
    {
      title: 'Model venda_entrades_segures.esdeveniment existeix',
      run: async () => {
        const data = await json2(values, 'venda_entrades_segures.esdeveniment', 'fields_get', {})
        return data ? ok('El model venda_entrades_segures.esdeveniment respon.') : fail('No hi ha metadades d\'venda_entrades_segures.esdeveniment.')
      },
    },
    ...REQUIRED_FIELDS.map(({ key, check, hint }) => ({
      title: `Camp ${key} — tipus i atributs correctes`,
      run: async () => {
        const data = await json2(values, 'venda_entrades_segures.tiquet', 'fields_get', {})
        const field = data?.[key]
        if (!field) return fail(`No s\'ha detectat el camp ${key}.`)
        return check(field) ? ok(`${key} té el tipus i atributs correctes.`) : warn(`${key} existeix però ${hint}`)
      },
    })),
    {
      title: 'preu_final emmagatzemat (store=True) — comprova via search_read',
      run: async () => {
        let createdPartnerId = null
        let desenvolupamentId = null
        let tiquetId = null

        try {
          const stamp = Date.now()
          const partner = await getPartnerForComputedTests(values, stamp)
          createdPartnerId = partner.createdPartnerId

          if (!partner.partnerId) {
            return fail('No s\'ha pogut obtenir un comprador per provar preu_final.')
          }

          desenvolvmentId = toSingleId(await json2(values, 'venda_entrades_segures.descoberta', 'create', {
            values: {
              name: `Descoberta test ${stamp}`,
              preu_base: 100,
            },
          }))
          if (!desenvolupamentId) return fail('No s\'ha pogut crear la descoberta de prova.')

          tiquetId = toSingleId(await json2(values, 'venda_entrades_segures.tiquet', 'create', {
            values: {
              name: `Tiquet test ${stamp}`,
              comprador_id: partner.partnerId,
              esdeveniment_id: desenvolupamentId,
            },
          }))
          if (!tiquetId) return fail('No s\'ha pogut crear el tiquet de prova.')

          const data = await json2(values, 'venda_entrades_segures.tiquet', 'search_read', {
            domain: [['id', '=', tiquetId]],
            fields: ['preu_final'],
            limit: 1,
          })
          const records = Array.isArray(data) ? data : []
          if (!records.length) return fail('El tiquet creat no es pot llegir.')

          return typeof records[0].preu_final === 'number'
            ? ok(`preu_final és un número (${records[0].preu_final}) llegit directament de BD.`)
            : fail('preu_final no retorna un número — possiblement no és store=True.')
        } finally {
          if (tiquetId) await json2(values, 'venda_entrades_segures.tiquet', 'unlink', { ids: [tiquetId] }).catch(() => {})
          if (desenvolupamentId) await json2(values, 'venda_entrades_segures.esdeveniment', 'unlink', { ids: [desenvolupamentId] }).catch(() => {})
          if (createdPartnerId) await json2(values, 'res.partner', 'unlink', { ids: [createdPartnerId] }).catch(() => {})
        }
      },
    },
    {
      title: 'Crear esdeveniment i tiquet — codi_seguretat és computat i té el valor esperat',
      run: async () => {
        let createdPartnerId = null
        let esdevenimentId = null
        let tiquetId = null

        try {
          const stamp = Date.now()
          const partner = await getPartnerForComputedTests(values, stamp)
          createdPartnerId = partner.createdPartnerId

          if (!partner.partnerId || !partner.partnerName) {
            return fail('No s\'ha trobat ni creat cap comprador per provar codi_seguretat.')
          }

          esdevenimentId = toSingleId(await json2(values, 'venda_entrades_segures.esdeveniment', 'create', {
            values: {
              name: `Esdeveniment test ${stamp}`,
              preu_base: 100,
            },
          }))
          if (!esdevenimentId) return fail('No s\'ha pogut crear l\'esdeveniment de prova.')

          tiquetId = toSingleId(await json2(values, 'venda_entrades_segures.tiquet', 'create', {
            values: {
              name: `Tiquet test ${stamp}`,
              comprador_id: partner.partnerId,
              esdeveniment_id: esdevenimentId,
              codi_seguretat: 'MANUAL_OVERRIDE',
            },
          }))
          if (!tiquetId) return fail('No s\'ha pogut crear el tiquet de prova.')

          let manualWriteBlocked = false
          try {
            await json2(values, 'venda_entrades_segures.tiquet', 'write', {
              ids: [tiquetId],
              values: { codi_seguretat: 'MANUAL_OVERRIDE' },
            })
          } catch {
            manualWriteBlocked = true
          }

          const read = await json2(values, 'venda_entrades_segures.tiquet', 'read', {
            ids: [tiquetId],
            fields: ['codi_seguretat'],
          })
          const rec = Array.isArray(read) ? read[0] : null
          const actualCode = rec?.codi_seguretat
          const expectedCodes = [
            `${partner.partnerName}-${esdevenimentId}`,
            `${partner.partnerName}-ID-${esdevenimentId}`,
          ]

          if (typeof actualCode !== 'string' || !actualCode.trim()) {
            return fail('codi_seguretat no retorna cap string després de crear el tiquet.')
          }

          if (!expectedCodes.includes(actualCode)) {
            return fail(`codi_seguretat="${actualCode}"; s\'esperava un valor derivat del comprador i l\'esdeveniment com ${expectedCodes.join(' o ')}.`)
          }

          if (!manualWriteBlocked && actualCode === 'MANUAL_OVERRIDE') {
            return fail('codi_seguretat conserva el valor manual i no sembla un camp computed.')
          }

          return ok(`codi_seguretat s\'ha calculat correctament amb el valor "${actualCode}" i no s\'ha mantingut el valor manual.`)
        } finally {
          if (tiquetId) await json2(values, 'venda_entrades_segures.tiquet', 'unlink', { ids: [tiquetId] }).catch(() => {})
          if (esdevenimentId) await json2(values, 'venda_entrades_segures.esdeveniment', 'unlink', { ids: [esdevenimentId] }).catch(() => {})
          if (createdPartnerId) await json2(values, 'res.partner', 'unlink', { ids: [createdPartnerId] }).catch(() => {})
        }
      },
    },
    {
      title: 'data_limit_acces és computat i té el valor esperat respecte a data_limit_acces de l\'esdeveniment',
      run: async () => {
        let createdPartnerId = null
        let esdevenimentId = null
        let tiquetId = null

        try {
          const stamp = Date.now()
          const partner = await getPartnerForComputedTests(values, stamp)
          createdPartnerId = partner.createdPartnerId

          if (!partner.partnerId || !partner.partnerName) {
            return fail('No s\'ha trobat ni creat cap comprador per provar data_limit_acces.')
          }

          esdevenimentId = toSingleId(await json2(values, 'venda_entrades_segures.esdeveniment', 'create', {
            values: {
              name: `Esdeveniment test ${stamp}`,
              preu_base: 100,
              data_limit_acces: '2024-12-31 20:00:00',
            },
          }))
          if (!esdevenimentId) return fail('No s\'ha pogut crear l\'esdeveniment de prova.')

          tiquetId = toSingleId(await json2(values, 'venda_entrades_segures.tiquet', 'create', {
            values: {
              name: `Tiquet test ${stamp}`,
              comprador_id: partner.partnerId,
              esdeveniment_id: esdevenimentId,
            },
          }))
          if (!tiquetId) return fail('No s\'ha pogut crear el tiquet de prova.')

          const read = await json2(values, 'venda_entrades_segures.tiquet', 'read', {
            ids: [tiquetId],
            fields: ['data_limit_acces'],
          })
          const rec = Array.isArray(read) ? read[0] : null
          const actualDate = rec?.data_limit_acces

          if (!actualDate) {
            return fail('data_limit_acces no retorna cap valor després de crear el tiquet.')
          }

          const expectedDate = '2024-12-31 18:00:00'
          if (actualDate !== expectedDate) {
            return fail(`data_limit_acces="${actualDate}"; s\'esperava "${expectedDate}" que és 2 hores abans de data_limit_acces de l\'esdeveniment.`)
          }

          return ok('data_limit_acces s\'ha calculat correctament com 2 hores abans de data_limit_acces de l\'esdeveniment.')
        } finally {
          if (tiquetId) await json2(values, 'venda_entrades_segures.tiquet', 'unlink', { ids: [tiquetId] }).catch(() => {})
          if (esdevenimentId) await json2(values, 'venda_entrades_segures.esdeveniment', 'unlink', { ids: [esdevenimentId] }).catch(() => {})
          if (createdPartnerId) await json2(values, 'res.partner', 'unlink', { ids: [createdPartnerId] }).catch(() => {})
        }
      },
    },
    {
      title: 'clausules_legals conté etiquetes HTML <b> o <strong>',
      run: async () => {
        let createdPartnerId = null
        let desenvolupamentId = null
        let tiquetId = null

        try {
          const stamp = Date.now()
          const partner = await getPartnerForComputedTests(values, stamp)
          createdPartnerId = partner.createdPartnerId

          if (!partner.partnerId) {
            return fail('No s\'ha pogut obtenir un comprador per provar clausules_legals.')
          }

          desenvolupamentId = toSingleId(await json2(values, 'venda_entrades_segures.descoberta', 'create', {
            values: {
              name: `Descoberta test ${stamp}`,
              preu_base: 100,
            },
          }))
          if (!desenvolupamentId) return fail('No s\'ha pogut crear la descoberta de prova.')

          tiquetId = toSingleId(await json2(values, 'venda_entrades_segures.tiquet', 'create', {
            values: {
              name: `Tiquet test ${stamp}`,
              comprador_id: partner.partnerId,
              descoberta_id: desenvolupamentId,
            },
          }))
          if (!tiquetId) return fail('No s\'ha pogut crear el tiquet de prova.')

          const data = await json2(values, 'venda_entrades_segures.tiquet', 'search_read', {
            domain: [['id', '=', tiquetId]],
            fields: ['clausules_legals'],
            limit: 1,
          })
          const rec = Array.isArray(data) ? data[0] : null
          if (!rec) return fail('El tiquet creat no es pot llegir.')

          const html = rec.clausules_legals ?? ''
          return /<b>|<strong>/i.test(html)
            ? ok('clausules_legals conté <b> o <strong> amb el nom del comprador.')
            : fail('clausules_legals no conté <b> ni <strong>.')
        } finally {
          if (tiquetId) await json2(values, 'venda_entrades_segures.tiquet', 'unlink', { ids: [tiquetId] }).catch(() => {})
          if (desenvolupamentId) await json2(values, 'venda_entrades_segures.descoberta', 'unlink', { ids: [desenvolupamentId] }).catch(() => {})
          if (createdPartnerId) await json2(values, 'res.partner', 'unlink', { ids: [createdPartnerId] }).catch(() => {})
        }
      },
    },
    {
      title: 'Vista list de venda_entrades_segures.tiquet té atribut sum a preu_final',
      run: async () => {
        const data = await json2(values, 'ir.ui.view', 'search_read', {
          domain: [['model', '=', 'venda_entrades_segures.tiquet'], ['type', '=', 'list']],
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
