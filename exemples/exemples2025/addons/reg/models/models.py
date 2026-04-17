# -*- coding: utf-8 -*-

from odoo import models, fields, api
from datetime import datetime
from datetime import timedelta
from odoo.exceptions import UserError

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

    def afegir_servicis(self):
        print(self)
        return {
            'name': 'Wizard Afegir Servicis',
            'type': 'ir.actions.act_window',
            'res_model': 'reg.valvula_servicis_wizard',
            'view_mode': 'form',
            'target': 'new',
        }


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

    @api.onchange('name')
    def _onchange_name(self):
        self.caval = 2
    #servics = fields.One2many('reg.servici', 'valvula')

    def create_valve(self):
        print(self.env.context.get('phone_context'))
        valvula = self.env['reg.valvula'].create({
            "name": self.name,
            "caval": self.caval,
            "soci": self.soci.id
        })
        return {
            'name': 'New Valve',
            'view_type': 'form',
            'view_mode': 'form',   # Pot ser form, tree, kanban...
            'res_model': 'reg.valvula', # El model de destí
            'res_id': valvula.id,       # El id concret per obrir el form
            # 'view_id': self.ref('wizards.reserves_form') # Opcional si hi ha més d'una vista posible.
            'context': self._context,   # El context es pot ampliar per afegir opcions
            'type': 'ir.actions.act_window',
            'target': 'current',  # Si ho fem en current, canvia la finestra actual.
        }

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


class valvula_servicis_wizard(models.TransientModel):
    _name = 'reg.valvula_servicis_wizard'
    _description = 'valvules valvula_servicis_wizard'

    valvula_id = fields.Many2one('reg.valvula', default = lambda v: v._context.get('active_id'))

    servicis = fields.One2many('reg.servicis_valvula_wizard','valvula_wizard')
    hora_inici_aux = fields.Datetime()
    hora_fi_aux = fields.Datetime()

    @api.onchange('hora_inici_aux')
    def _onchange_hora_inici_aux(self):
        hora_inici = self.hora_inici_aux
        if hora_inici:
            hora_fi=hora_inici+timedelta(hours=1)
            self.hora_fi_aux=fields.Datetime.to_string(hora_fi)
    
    #@api.onchange('hora_fi_aux')
    #def _onchange_hora_fi_aux(self):
    #    if self.hora_inici_aux and self.hora_fi_aux:
    #        if self.hora_inici_aux > self.hora_fi_aux:
    #            hora_inici = self.hora_inici_aux
    #            hora_fi=hora_inici+timedelta(hours=1)
    #            self.hora_fi_aux=fields.Datetime.to_string(hora_fi)
                #raise UserError('No valid date')


    def add_service(self):
        if self.hora_inici_aux > self.hora_fi_aux:
            return {
                    'type': 'ir.actions.client',
                    'tag': 'display_notification',
                    'params': {
                        'message': 'No valid date',
                        'type': 'danger',  #types: success,warning,danger,info
                        'sticky': False,
                    }
                }
        self.servicis.create({
            "valvula_wizard": self.id,
            "hora_inici": self.hora_inici_aux,
            "hora_fi": self.hora_fi_aux,
            "name": str(self.valvula_id.name)+" "+str(self.hora_inici_aux)
        })
        return {
            'type': 'ir.actions.act_window',
            'res_model': self._name,
            'res_id': self.id,
            'view_mode': 'form',
            'target': 'new',
        }

    def add_services(self):
        print(self)
        for s in self.servicis:
            self.env['reg.servici'].create({
                "valvula": self.valvula_id.id,
                "name": s.name,
                "hora_inici": s.hora_inici,
                "hora_fi": s.hora_fi
            })
        

class servicis_valvula_wizard(models.TransientModel):
    _name = 'reg.servicis_valvula_wizard'
    _description = 'servicis servicis_valvula_wizard'

    valvula_wizard = fields.Many2one('reg.valvula_servicis_wizard')
    name = fields.Char()
    hora_inici = fields.Datetime()
    hora_fi = fields.Datetime()    