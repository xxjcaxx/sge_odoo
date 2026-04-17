export const COMMON_FIELDS = [
  { key: 'odooUrl', label: 'URL base Odoo', type: 'url', placeholder: 'http://ip-o-domini:8069', required: true },
  { key: 'database', label: 'Base de dades (X-Odoo-Database)', type: 'text', placeholder: 'nom_db' },
  { key: 'apiKey', label: 'API Key (Bearer)', type: 'password', placeholder: '********' },
  { key: 'modelName', label: 'Model principal', type: 'text', placeholder: 'rpg.personatge' },
  { key: 'externalId', label: 'External ID (opcional)', type: 'text', placeholder: 'modul.view_search_x' },
]
