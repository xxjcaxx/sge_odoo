# -*- coding: utf-8 -*-

from odoo import models, fields, api
from odoo.exceptions import ValidationError

class object(models.Model):
    _name = 'lol.object'
    _description = 'Objects'

    name = fields.Char()
    type = fields.Many2one('lol.object_type', ondelete='restrict')
    character = fields.Many2one('lol.character', ondelete='cascade')
    level = fields.Integer()
    rust = fields.Float()
    characters = fields.Many2many('lol.character')
    damage = fields.Float(compute='_get_damage')
    #damage = fields.Float(related='type.damage')
    @api.constrains('level')
    def _check_level(self):
        for o in self:
            if o.level > 10:
                raise ValidationError("Your level is not valid: %s" % o.level)

    def increase_level(self):
        for o in self:
            o.level = o.level + 1

    @api.depends('type','level','rust')
    def _get_damage(self):
        for o in self:
            o.damage = o.type.damage * o.level - o.rust



class object_type(models.Model):
    _name = 'lol.object_type'
    _description = 'Object types'

    name = fields.Char()
    type = fields.Selection([
        ('armor','Armor'),
        ('weapon','Weapon'),
        ('spell','Spell') ])
    character_type = fields.Many2one('lol.character_type')
    damage = fields.Float(default=1)

