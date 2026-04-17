import { createExercise } from './createExercise'
import { fail, json2, normalizeBaseUrl, ok, proxyHttp, warn, withAuthHeaders } from '../services/odooClient'

export const exercise = createExercise({
  slug: 'practica_report',
  specificFields: [
    { key: 'reportExternalId', label: 'External ID del report (ir.actions.report)', type: 'text', placeholder: 'el_teu_modul.report_entrada_seguretat' },
    { key: 'saleOrderId', label: 'ID d\'una sale.order per previsualitzar', type: 'number', placeholder: '1' },
  ],
  createTests: (values) => [
    {
      title: 'Camp token_seguretat a sale.order',
      run: async () => {
        const data = await json2(values, 'sale.order', 'fields_get', {})
        return 'token_seguretat' in (data ?? {})
          ? ok('token_seguretat existeix a sale.order.')
          : fail('No s\'ha detectat token_seguretat a sale.order.')
      },
    },
    {
      title: 'Camp qr_data computat a sale.order',
      run: async () => {
        const data = await json2(values, 'sale.order', 'fields_get', {})
        const f = data?.qr_data
        if (!f) return fail('No s\'ha detectat qr_data a sale.order.')
        return f.compute ? ok('qr_data existeix i és computat.') : warn('qr_data existeix però no s\'ha pogut confirmar que siga computat.')
      },
    },
    {
      title: 'Existeix report ir.actions.report per a sale.order',
      run: async () => {
        const data = await json2(values, 'ir.actions.report', 'search_read', {
          domain: [['model', '=', 'sale.order'], ['report_type', '=', 'qweb-pdf']],
          fields: ['name', 'report_name', 'report_type'],
          limit: 5,
        })
        const recs = Array.isArray(data) ? data : []
        return recs.length > 0
          ? ok(`Detectat report: "${recs[0].name}" (${recs[0].report_name}).`)
          : fail('No hi ha cap report qweb-pdf associat a sale.order.')
      },
    },
    {
      title: 'Existeix paper format personalitzat per al report',
      run: async () => {
        const data = await json2(values, 'report.paperformat', 'search_read', {
          domain: [],
          fields: ['name', 'format', 'page_height', 'page_width'],
          limit: 10,
        })
        const all = Array.isArray(data) ? data : []
        const custom = all.filter((p) => p.page_height && p.page_width && p.format === 'custom')
        return custom.length > 0
          ? ok(`Paper format personalitzat: "${custom[0].name}" (${custom[0].page_width}x${custom[0].page_height} mm).`)
          : warn('No s\'ha detectat cap paper format custom — comprova que has creat un format a mida de ticket.')
      },
    },
    {
      title: 'HTML del report conté codi QR (<img>)',
      run: async () => {
        const orderId = parseInt(values.saleOrderId, 10)
        if (!orderId) return warn('Introdueix l\'ID d\'una sale.order per previsualitzar el report HTML.')
        const reports = await json2(values, 'ir.actions.report', 'search_read', {
          domain: [['model', '=', 'sale.order'], ['report_type', '=', 'qweb-pdf']],
          fields: ['report_name'],
          limit: 1,
        })
        const reportName = Array.isArray(reports) ? reports[0]?.report_name : null
        if (!reportName) return warn('No s\'ha trobat el report per construir la URL HTML.')
        const url = `${normalizeBaseUrl(values.odooUrl)}/report/html/${reportName}/${orderId}`
        const resp = await proxyHttp(url, { method: 'GET', headers: withAuthHeaders(values) })
        if (!resp.ok) return fail(`Petició al report HTML ha fallat: HTTP ${resp.status}.`)
        const html = await resp.text()
        const hasQr = /<img[^>]+qr/i.test(html) || /barcode/.test(html)
        return hasQr ? ok('El HTML del report conté un codi QR (<img> amb QR/barcode).') : warn('No s\'ha detectat QR a l\'HTML del report — comprova la plantilla QWeb.')
      },
    },
  ],
})
