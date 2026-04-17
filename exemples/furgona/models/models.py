# -*- coding: utf-8 -*-

from odoo import models, fields, api
from odoo.exceptions import ValidationError

class furgona(models.Model):
     _name = 'furgona.furgona'
     _description = 'furgona.furgona'

     name = fields.Char()
     capacity = fields.Float()
     plate = fields.Char()
     photo = fields.Image(max_width=200)
     historic_paquets = fields.Many2many('sale.order.line',compute='_get_historic_paquets')

     def _get_historic_paquets(self):
          print(self)
          for f in self:
               f.historic_paquets = (self.env['furgona.travel']
                                     .search([('furgona', '=', f.id)])
                                     .mapped(lambda t: t.paquets).ids)


class paquet(models.Model):
     _name = 'sale.order.line'
     _inherit = 'sale.order.line'

     volume = fields.Float()
     viatge_id = fields.Many2one('furgona.travel')
     clients = fields.Many2many('furgona.client', relation='paquet_clients2')
     veins = fields.Many2many('furgona.client',  relation='paquet_veins2')
     is_paquet = fields.Boolean()

class travel(models.Model):
     _name = 'furgona.travel'
     _description = 'furgona.travel'

     name = fields.Char(string="Identificator")
     driver = fields.Many2one('res.partner')
     furgona = fields.Many2one('furgona.furgona')
     m3 = fields.Float(compute='_get_m3')
     paquets = fields.One2many('sale.order.line','viatge_id')
     delivery_date = fields.Datetime()
     duration = fields.Integer()

     @api.depends('paquets')
     def _get_m3(self):
          for t in self:
               t.m3 = sum(t.paquets.mapped(lambda p: p.volume))

     @api.constrains('paquets','furgona')
     def _check_capacidad(self):
          for t in self:
               if t.m3 > t.furgona.capacity:
                    raise ValidationError("Your record is too old: %s" % t.m3)

     def reduce_duration(self):
          for travel in self.search([]):
               travel.duration = travel.duration - 1


class travel_furgona_wizard(models.TransientModel):
     _name = 'furgona.travel_furgona_wizard'
     _description = 'furgona.travel_furgona_wizard'

     def _getFurgona(self):
          print(self.env.context)
          return self.env.context.get('furgona_context')
     def _getTravel(self):
          return self.env.context.get('travel_context')

     furgona = fields.Many2one('furgona.furgona', default=_getFurgona)
     travel = fields.Many2one('furgona.travel', default=_getTravel)
     state = fields.Selection([
          ('1','Select Travel'),
          ('2','Select Furgona')
     ], default='1')


     def action_travel(self):
          self.state = '1'
          return {
               'type': 'ir.actions.act_window',
               'res_model': self._name,
               'res_id': self.id,
               'view_mode': 'form',
               'target': 'new',
          }


     def action_furgona(self):
          self.state = '2'
          return {
               'type': 'ir.actions.act_window',
               'res_model': self._name,
               'res_id': self.id,
               'view_mode': 'form',
               'target': 'new',
          }

     def save_travel(self):
          self.travel.write({
               'furgona': self.furgona.id
          })


class client(models.Model):
     _name = 'furgona.client'
     _description = 'furgona.client'

     name = fields.Char()
     paquets = fields.Many2many('sale.order.line', relation='paquet_clients2')
     paquets_veins = fields.Many2many('sale.order.line',  relation='paquet_veins2')