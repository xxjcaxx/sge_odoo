# -*- coding: utf-8 -*-
from odoo import http
import json

class Natacio(http.Controller):
    @http.route('/natacio/holamon', auth='public')
    def index(self, **kw):
        return "Hello, world"

    @http.route('/natacio/clubs/json', type='json', auth='public')
    def listjson(self, **kw):
        #cors='*'
        records = http.request.env['natacio.club'].sudo().search([])
        print(records)
        return records.read(['name'])
    
    @http.route('/natacio/clubs/string',  auth='public',  cors='*', csrf=False,)
    def liststring(self, **kw):
        records = http.request.env['natacio.club'].sudo().search([])
        
        return http.Response(
            json.dumps(records.read(['name'])),
            content_type='application/json',
            status=200
        )

  
