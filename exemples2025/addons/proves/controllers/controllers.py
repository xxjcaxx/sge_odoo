# -*- coding: utf-8 -*-
# from odoo import http


# class Proves(http.Controller):
#     @http.route('/proves/proves', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/proves/proves/objects', auth='public')
#     def list(self, **kw):
#         return http.request.render('proves.listing', {
#             'root': '/proves/proves',
#             'objects': http.request.env['proves.proves'].search([]),
#         })

#     @http.route('/proves/proves/objects/<model("proves.proves"):obj>', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('proves.object', {
#             'object': obj
#         })

