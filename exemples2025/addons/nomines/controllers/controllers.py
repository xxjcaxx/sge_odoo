# -*- coding: utf-8 -*-
# from odoo import http


# class Nomines(http.Controller):
#     @http.route('/nomines/nomines', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/nomines/nomines/objects', auth='public')
#     def list(self, **kw):
#         return http.request.render('nomines.listing', {
#             'root': '/nomines/nomines',
#             'objects': http.request.env['nomines.nomines'].search([]),
#         })

#     @http.route('/nomines/nomines/objects/<model("nomines.nomines"):obj>', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('nomines.object', {
#             'object': obj
#         })

