import json

from odoo import http
from odoo.http import request


class Drive(http.Controller):
     @http.route('/drive/files', auth='public', type='http', methods=['GET'], csrf=False, cors='*')
     def index(self, **kw):
          
          criterio = (kw.get('q') or kw.get('search') or '').strip()
          domain = []
          if criterio:
               domain = [('name', 'ilike', criterio)]

          files = request.env['drive.file'].sudo().search(domain, order='name asc')
          payload = [
               {
                    'id': file.id,
                    'name': file.name,
               }
               for file in files
          ]

          body = json.dumps(
               {
                    'count': len(payload),
                    'query': criterio,
                    'results': payload,
               },
               ensure_ascii=False,
          )
          
          return request.make_response(body)

