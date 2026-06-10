from odoo import models, fields, api


class drive(models.Model):
    _name = 'drive.file'
    _description = 'drive.file'

    name = fields.Char()
    file = fields.Binary()
    user = fields.Many2one('res.users')
    users = fields.Many2many('res.users', string='Users with access')

