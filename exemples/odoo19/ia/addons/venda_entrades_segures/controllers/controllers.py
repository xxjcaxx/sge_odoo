# from odoo import http


# class VendaEntradesSegures(http.Controller):
#     @http.route('/venda_entrades_segures/venda_entrades_segures', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/venda_entrades_segures/venda_entrades_segures/objects', auth='public')
#     def list(self, **kw):
#         return http.request.render('venda_entrades_segures.listing', {
#             'root': '/venda_entrades_segures/venda_entrades_segures',
#             'objects': http.request.env['venda_entrades_segures.venda_entrades_segures'].search([]),
#         })

#     @http.route('/venda_entrades_segures/venda_entrades_segures/objects/<model("venda_entrades_segures.venda_entrades_segures"):obj>', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('venda_entrades_segures.object', {
#             'object': obj
#         })

