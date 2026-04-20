# from odoo import http


# class Basquet(http.Controller):
#     @http.route('/basquet/basquet', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/basquet/basquet/objects', auth='public')
#     def list(self, **kw):
#         return http.request.render('basquet.listing', {
#             'root': '/basquet/basquet',
#             'objects': http.request.env['basquet.basquet'].search([]),
#         })

#     @http.route('/basquet/basquet/objects/<model("basquet.basquet"):obj>', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('basquet.object', {
#             'object': obj
#         })

