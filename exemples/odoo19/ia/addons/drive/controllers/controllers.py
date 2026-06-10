# from odoo import http


# class Drive(http.Controller):
#     @http.route('/drive/drive', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/drive/drive/objects', auth='public')
#     def list(self, **kw):
#         return http.request.render('drive.listing', {
#             'root': '/drive/drive',
#             'objects': http.request.env['drive.drive'].search([]),
#         })

#     @http.route('/drive/drive/objects/<model("drive.drive"):obj>', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('drive.object', {
#             'object': obj
#         })

