# from odoo import http


# class Entrades(http.Controller):
#     @http.route('/entrades/entrades', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/entrades/entrades/objects', auth='public')
#     def list(self, **kw):
#         return http.request.render('entrades.listing', {
#             'root': '/entrades/entrades',
#             'objects': http.request.env['entrades.entrades'].search([]),
#         })

#     @http.route('/entrades/entrades/objects/<model("entrades.entrades"):obj>', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('entrades.object', {
#             'object': obj
#         })

