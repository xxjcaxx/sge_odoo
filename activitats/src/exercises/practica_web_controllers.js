import { createExercise } from './createExercise'
import { fail, normalizeBaseUrl, ok, proxyHttp, withBasicHeaders } from '../services/odooClient'

export const exercise = createExercise({
  slug: 'practica_web_controllers',
  specificFields: [
    { key: 'apiRoute', label: 'Ruta API', type: 'text', placeholder: '/rpg/api' },
    { key: 'basicUser', label: 'Usuari API REST', type: 'text', placeholder: 'admin' },
    { key: 'basicPassword', label: 'Contrasenya API REST', type: 'password', placeholder: '********' },
  ],
  createTests: (values) => [
    {
      title: 'GET JSON del controlador RPG',
      run: async () => {
        const route = values.apiRoute || '/rpg/api'
        const response = await proxyHttp(`${normalizeBaseUrl(values.odooUrl)}${route}`, {
          method: 'GET',
          headers: withBasicHeaders({ Accept: 'application/json' }, values),
        })
        return response.ok ? ok(`Resposta correcta en GET ${route}.`) : fail(`GET ${route} ha fallat amb HTTP ${response.status}.`)
      },
    },
  ],
})
