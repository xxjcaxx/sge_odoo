from odoo import models, fields, api


class tots(models.Model):
    _name = 'proves.tots'
    _description = 'proves.tots'

    name = fields.Char(required=True)
    value = fields.Integer(required=True)
    value2 = fields.Float(compute="_value_pc", store=True)
    description = fields.Text(default="hola mon")
    active = fields.Boolean(default=False)
    day = fields.Date()
    time = fields.Datetime()
    html = fields.Html()
    doc = fields.Binary()
    foto = fields.Image(max_width = 100, max_height=100)
    category = fields.Selection([('1','una'),('2','dos'),('3','tres')])
