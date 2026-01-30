# -*- coding: utf-8 -*-
# from odoo import http


# class Reg(http.Controller):
#     @http.route('/reg/reg', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/reg/reg/objects', auth='public')
#     def list(self, **kw):
#         return http.request.render('reg.listing', {
#             'root': '/reg/reg',
#             'objects': http.request.env['reg.reg'].search([]),
#         })

#     @http.route('/reg/reg/objects/<model("reg.reg"):obj>', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('reg.object', {
#             'object': obj
#         })

