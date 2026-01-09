# -*- coding: utf-8 -*-

from odoo import models, fields, api
from datetime import datetime

class soci(models.Model):
     #_name = 'reg.reg'
     #_description = 'reg.soci'
     _inherit = 'res.partner'

     valvules = fields.One2many('reg.valvula', 'soci')

class valvula(models.Model):
    _name = 'reg.valvula'
    _description = 'valvules'

    name = fields.Char()
    caval = fields.Float()
    soci = fields.Many2one('res.partner')
    servics = fields.One2many('reg.servici', 'valvula')

class valvula_wizard(models.TransientModel):
    _name = 'reg.valvula_wizard'
    _description = 'valvules wizard'

    name = fields.Char()
    caval = fields.Float()
    #soci = fields.Many2one('res.partner', default = lambda v: v._context.get('soci_context'))
    soci = fields.Many2one('res.partner', default = lambda v: v._context.get('active_id'))
    state = fields.Selection([
        ('valvula', "Valve data"),
        ('soci', "Select Soci"),  
        ('resume', "Resume")                                                                      
      ], default='valvula')


    #servics = fields.One2many('reg.servici', 'valvula')

    def create_valve(self):
        print(self.env.context.get('phone_context'))
        self.env['reg.valvula'].create({
            "name": self.name,
            "caval": self.caval,
            "soci": self.soci.id
        })

    def next(self):
        if self.state == 'valvula':
            self.state = 'soci'
        elif self.state == 'soci':
            self.state = 'resume'

        return {
            'type': 'ir.actions.act_window',
            'res_model': self._name,
            'res_id': self.id,
            'view_mode': 'form',
            'target': 'new',
        }


    def previous(self):
        if self.state == 'resume':
            self.state = 'soci'
        elif self.state == 'soci':
            self.state = 'valvula'

        return {
            'type': 'ir.actions.act_window',
            'res_model': self._name,
            'res_id': self.id,
            'view_mode': 'form',
            'target': 'new',
        }


class servici(models.Model):
    _name = 'reg.servici'

    name = fields.Char()
    hora_inici = fields.Datetime()
    hora_fi = fields.Datetime()
    valvula = fields.Many2one('reg.valvula')

    def fer_venda(self):
        print(self)
        order = self.env['sale.order'].create({
            "partner_id": self.valvula.soci.id
        })
        
 
        start=fields.Datetime.from_string(self.hora_inici)
        end=fields.Datetime.from_string(self.hora_fi)
        print(start,end)
        
        print ((end - start))
        q = ((end - start).total_seconds()/60) * self.valvula.caval
        order_line = self.env['sale.order.line'].create({
            "product_id": self.env.ref('reg.producte_servici').id,
            "product_uom_qty": q,
            "order_id": order.id
        })


int