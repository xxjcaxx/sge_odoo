# -*- coding: utf-8 -*-

from odoo import models, fields, api


class character(models.Model):
     _name = 'lol.character'
     _description = 'Character'

     name = fields.Char()
     type = fields.Many2one('lol.character_type',  ondelete='restrict')
     image = fields.Image(related='type.image', store=False)
     player = fields.Many2one('res.partner',  ondelete='cascade')
     armor = fields.Many2one('lol.object', domain="[('type.type','=','armor')]")
     level = fields.Integer(default=1)
     experience = fields.Float(default=0)
     objects = fields.Many2many('lol.object', domain="[('type.character_type','=',type)]")
     objects_qty = fields.Integer(compute='_get_objects_qty')
     inventory = fields.Many2many(comodel_name='lol.object', # El model en el que es relaciona
                            relation='inventory_objects_characters', # (opcional) el nom del la taula en mig
                            column1='character_id', # (opcional) el nom en la taula en mig de la columna d'aquest model
                            column2='object_id')  # (opcional) el nom de la columna de l'altre model.

     @api.depends('objects')
     def  _get_objects_qty(self):
         for character in self:
           #  print(self, character, character.objects)
             character.objects_qty = len(character.objects)


     def increase_experience(self,character):
         character.experience = character.experience + 0.01
     def increase_experience_cron(self):
         tots = self.search([('experience','<',100)])
         print(self,tots)
         for character in tots:
             self.increase_experience(character)
     def increase_experience_button(self):
        for character in self:
            self.increase_experience(character)
class character_type(models.Model):
    _name = 'lol.character_type'
    _description = 'Character types'

    name = fields.Char()
    image = fields.Image(max_width=200, max_height=200)


class character_wizard(models.TransientModel):
    _name = 'lol.character_wizard'
    _description = 'Character wizard'

    def get_type(self):
        print(self._context.get('type_name'))
        return self.env['lol.character_type'].browse(self._context.get('active_id'))

    name = fields.Char()
    type = fields.Many2one('lol.character_type', ondelete='restrict', default=get_type)
    image = fields.Image(related='type.image', store=False)
    player = fields.Many2one('res.partner', ondelete='cascade')
    armor = fields.Many2one('lol.object', domain="[('type.type','=','armor')]")
    level = fields.Integer(default=1)
    experience = fields.Float(default=0)
    state = fields.Selection([
        ('basic', "Basic Data"),
        ('player', "Player Data"),
        ('stats', "Stats Data"),
    ], default='basic')

    def create_character(self):
        character = self.env['lol.character'].create(
            {
                'name': self.name,
                'type': self.type.id,
                'player': self.player.id,
                'armor': self.armor.id,
                'level': self.level,
                'experience': self.experience
            }
        )

    def next(self):
        if(self.state == 'basic'):
            self.state = 'player'
        elif(self.state == 'player'):
            self.state = 'stats'
        return {
            'type': 'ir.actions.act_window',
            'res_model': self._name,
            'res_id': self.id,
            'view_mode': 'form',
            'target': 'new',
        }


    def previous(self):
        if(self.state == 'player'):
            self.state = 'basic'
        elif(self.state == 'stats'):
            self.state = 'player'

        return {
            'type': 'ir.actions.act_window',
            'res_model': self._name,
            'res_id': self.id,
            'view_mode': 'form',
            'target': 'new',
        }