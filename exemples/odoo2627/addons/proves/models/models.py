from odoo import models, fields, api


class proves(models.Model):
    _name = 'proves.proves'
    _description = 'proves.proves'

    name = fields.Char()
    description = fields.Html()




