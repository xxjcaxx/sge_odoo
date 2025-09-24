# -*- coding: utf-8 -*-
# from odoo import http


# class Natacio(http.Controller):
#     @http.route('/natacio/natacio', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/natacio/natacio/objects', auth='public')
#     def list(self, **kw):
#         return http.request.render('natacio.listing', {
#             'root': '/natacio/natacio',
#             'objects': http.request.env['natacio.natacio'].search([]),
#         })

#     @http.route('/natacio/natacio/objects/<model("natacio.natacio"):obj>', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('natacio.object', {
#             'object': obj
#         })

