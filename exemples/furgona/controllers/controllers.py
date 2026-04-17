# -*- coding: utf-8 -*-
# from odoo import http


# class Furgona(http.Controller):
#     @http.route('/furgona/furgona', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/furgona/furgona/objects', auth='public')
#     def list(self, **kw):
#         return http.request.render('furgona.listing', {
#             'root': '/furgona/furgona',
#             'objects': http.request.env['furgona.furgona'].search([]),
#         })

#     @http.route('/furgona/furgona/objects/<model("furgona.furgona"):obj>', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('furgona.object', {
#             'object': obj
#         })

