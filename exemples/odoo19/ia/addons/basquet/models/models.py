from odoo import models, fields, api
from odoo.exceptions import ValidationError
import random


class equip(models.Model):
    _name = 'basquet.equip'
    _description = 'basquet.equip'

    name = fields.Char()
    ciutat = fields.Char()
    jugador_ids = fields.One2many('basquet.jugador', 'equip_id', string='Jugadors')
    estadi_id = fields.Many2one('basquet.pavello', string='Pavellò', domain="[('ciutat', '=', ciutat)]")
    equips_rivals_ids = fields.Many2many('basquet.equip', 'basquet_equip_rival_rel', 'equip_id', 'rival_id', string='Equips rivals')
    equips_agermanats_ids = fields.Many2many('basquet.equip', 'basquet_equip_agermanat_rel', 'equip_id', 'agermanat_id', string='Equips agermanats')

    @api.constrains('equips_agermanats_ids')
    def _check_agermanats(self):
        for e in self:
            if len(e.equips_agermanats_ids) > 4:
                raise ValidationError("Too many agermanats %s" % len(e.equips_agermanats_ids))

class jugador(models.Model):
    _name = 'basquet.jugador'
    _description = 'basquet.jugador'

    name = fields.Char()
    def _get_random_team(self):
        aleatori = random.randint(0,len(self.env['basquet.equip'].search([]))-1)
        return self.env['basquet.equip'].search([]).ids[aleatori]
    
    equip_id = fields.Many2one('basquet.equip', string='Equip', 
                               domain="[('estadi_id', '!=', False)]", default= lambda self: self.env['basquet.equip'].search([]).ids[random.randint(0,len(self.env['basquet.equip'].search([]))-1)])
    estadi_nom = fields.Char(string='Pavellò', related='equip_id.estadi_id.name')
    es_capita = fields.Boolean(string='És capità', default=False)
    triples = fields.Float(default = lambda self: random.random()*100)
    ptl = fields.Float(default = lambda self: random.random()*100)
    foto = fields.Image(max_width=100, max_height=100)


class pavello(models.Model):
    _name = 'basquet.pavello'
    _description = 'basquet.pavello'

    name = fields.Char()
    ciutat = fields.Char()
