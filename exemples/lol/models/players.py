# -*- coding: utf-8 -*-

from odoo import models, fields, api


class player(models.Model):
     _name = 'res.partner'
     _inherit = 'res.partner'
     _description = 'Players'


     nickname = fields.Char()
     def _get_date(self):
          return fields.Datetime.now()
     sign_up_date = fields.Datetime(default=_get_date)
     characters = fields.One2many('lol.character','player')
     is_player = fields.Boolean()