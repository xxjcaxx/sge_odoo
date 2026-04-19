// ─── Call logger ─────────────────────────────────────────────────────────────
// Tests can opt in by calling startCallLog() before run() and stopCallLog() after.
let _callLog = null

export function startCallLog() { _callLog = [] }
export function stopCallLog()  { const log = _callLog; _callLog = null; return log ?? [] }

function _recordCall(label, data) {
  if (_callLog) _callLog.push({ label, data })
}

export function ok(detail) {
  return { status: 'ok', detail }
}

export function warn(detail) {
  return { status: 'warn', detail }
}

export function fail(detail) {
  return { status: 'fail', detail }
}

export function normalizeBaseUrl(url = '') {
  return url.replace(/\/+$/, '')
}

export async function http(url, options) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }
}

export async function proxyHttp(url, options = {}) {
  const response = await http('/api/proxy/http', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url,
      method: options.method || 'GET',
      headers: options.headers || {},
      body: options.body,
    }),
  })

  const envelope = await response.json().catch(() => ({}))
  const status = typeof envelope?.status === 'number' ? envelope.status : response.status
  const bodyText = typeof envelope?.bodyText === 'string' ? envelope.bodyText : ''
  const bodyJson = envelope?.bodyJson

  return {
    ok: response.ok,
    status,
    headers: envelope?.headers || {},
    async text() {
      return bodyText
    },
    async json() {
      if (bodyJson && typeof bodyJson === 'object') {
        _recordCall(`proxyHttp ${options.method || 'GET'} ${url}`, bodyJson)
        return bodyJson
      }
      const parsed = JSON.parse(bodyText || '{}')
      _recordCall(`proxyHttp ${options.method || 'GET'} ${url}`, parsed)
      return parsed
    },
  }
}

export function withAuthHeaders(values) {
  const headers = {}
  if (values.apiKey) headers.Authorization = `Bearer ${values.apiKey}`
  if (values.database) headers['X-Odoo-Database'] = values.database
  return headers
}

export function withBasicHeaders(headers, values) {
  const output = { ...headers }
  if (values.basicUser && values.basicPassword) {
    output.Authorization = `Basic ${btoa(`${values.basicUser}:${values.basicPassword}`)}`
  }
  return output
}

export async function json2(values, model, method, params) {
  const url = '/api/odoo/json2'
  const payload = params ?? {}

  const response = await http(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      odooUrl: values.odooUrl,
      model,
      method,
      params: payload,
      apiKey: values.apiKey,
      database: values.database,
      basicUser: values.basicUser,
      basicPassword: values.basicPassword,
    }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data?.error?.message || `HTTP ${response.status}`)
  }

  _recordCall(`json2 ${model}.${method}`, data)
  return data
}

export function createBaseTests(values) {
  return [
    {
      title: 'Autenticació JSON-2',
      run: async () => {
        if (!values.apiKey) return warn('No hi ha API Key. Es salta la prova autenticada.')
        const data = await json2(values, 'res.users', 'search_read', { fields: ['id', 'name'], limit: 1 })

        const count = Array.isArray(data) ? data.length : 0

        return count > 0
          ? ok(`Autenticació correcta amb API JSON-2 (${count} registre(s) d'usuari).`)
          : fail('La crida ha respost, però no s\'han detectat registres d\'usuari en el format esperat.')
      },
    },
    {
      title: 'Lectura del model principal',
      run: async () => {
        if (!values.modelName) return warn('Sense model principal definit.')
        const data = await json2(values, values.modelName, 'fields_get', {})
        return data && typeof data === 'object' && Object.keys(data).length > 0
          ? ok('El model respon a fields_get.')
          : fail('No hi ha metadades del model.')
      },
    },
  ]
}
