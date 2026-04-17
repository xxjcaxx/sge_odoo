# -*- coding: utf-8 -*-
# from odoo import http


# class Roma(http.Controller):
#     @http.route('/roma/roma', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/roma/roma/objects', auth='public')
#     def list(self, **kw):
#         return http.request.render('roma.listing', {
#             'root': '/roma/roma',
#             'objects': http.request.env['roma.roma'].search([]),
#         })

#     @http.route('/roma/roma/objects/<model("roma.roma"):obj>', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('roma.object', {
#             'object': obj
#         })
