# -*- coding: utf-8 -*-
# from odoo import http


# class Recuperacio(http.Controller):
#     @http.route('/recuperacio/recuperacio', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/recuperacio/recuperacio/objects', auth='public')
#     def list(self, **kw):
#         return http.request.render('recuperacio.listing', {
#             'root': '/recuperacio/recuperacio',
#             'objects': http.request.env['recuperacio.recuperacio'].search([]),
#         })

#     @http.route('/recuperacio/recuperacio/objects/<model("recuperacio.recuperacio"):obj>', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('recuperacio.object', {
#             'object': obj
#         })

