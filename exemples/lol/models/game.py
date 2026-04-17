# -*- coding: utf-8 -*-

from odoo import models, fields, api
import random

def step_simulation(characters1,characters2):
    print(characters1, characters2)
    # Enfrontar aleatoriament dos characters
    characters1_ids = characters1.mapped(lambda c: c.id)
    random.shuffle(characters1_ids)
    characters2_ids = characters2.mapped(lambda c: c.id)
    random.shuffle(characters2_ids)
    print(characters1_ids,characters2_ids,zip(characters1_ids,characters2_ids))



class game(models.Model):
    _name = 'lol.game'
    _description = 'games'

    name = fields.Char()
    start_date = fields.Datetime()
    step_duration = fields.Integer()
    total_duration = fields.Integer(compute='_get_total_duration')
    steps = fields.Integer()
    steps_list = fields.One2many('lol.game_step','game')
    player1 = fields.Many2one('lol.player')
    player2 = fields.Many2one('lol.player')
    characters1 = fields.Many2many('lol.character', relation='game_characters1')
    characters2 = fields.Many2many('lol.character', relation='game_characters2')

    @api.depends('step_duration', 'steps')
    def _get_total_duration(self):
        for b in self:
            b.total_duration = b.step_duration * b.steps

    def new_step(self):
        for g in self:
            if g.steps > len(g.steps_list):
                step = self.env['lol.game_step'].create({
                    'name': 'step_'+str(len(g.steps_list)),
                    'game': g.id
                })
                step_simulation(g.characters1, g.characters2)


class game_step(models.Model):
    _name = 'lol.game_step'
    _description = 'game steps'

    name = fields.Char()
    game = fields.Many2one('lol.game')
    characters1 = fields.Many2many('lol.character', relation='game_step_characters1')
    characters2 = fields.Many2many('lol.character', relation='game_step_characters2')