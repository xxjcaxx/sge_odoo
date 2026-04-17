# -*- coding: utf-8 -*-
# from odoo import http


# class Lol(http.Controller):
#     @http.route('/lol/lol', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/lol/lol/objects', auth='public')
#     def list(self, **kw):
#         return http.request.render('lol.listing', {
#             'root': '/lol/lol',
#             'objects': http.request.env['lol.lol'].search([]),
#         })

#     @http.route('/lol/lol/objects/<model("lol.lol"):obj>', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('lol.object', {
#             'object': obj
#         })

