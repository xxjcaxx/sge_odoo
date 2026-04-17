# -*- coding: utf-8 -*-

from odoo import models, fields, api


class recuperacio(models.Model):
    _name = 'recuperacio.recuperacio'
    _description = 'recuperacio.recuperacio'

    name = fields.Char()


class player(models.Model):
    _name = 'recuperacio.player'
    _description = 'Player'

    name = fields.Char()
    avatar = fields.Image(max_width=200, max_height=200)
    buildings = fields.One2many('recuperacio.building','player_id')

class building(models.Model):
    _name = 'recuperacio.building'
    _description = 'Edificis'

    name = fields.Char()
    level = fields.Integer()
    player_avatar = fields.Image(related='player_id.avatar')
    player_id = fields.Many2one('recuperacio.player',string="Player")
    materials = fields.Many2many('recuperacio.material')

class material(models.Model):
    _name = 'recuperacio.material'
    _description = 'Materials'

    name = fields.Char()
    buildings = fields.Many2many('recuperacio.building')

class production(models.Model):
    _name = 'recuperacio.production'
    _description = 'Producció de materials pels edificis'

    name = fields.Char()
    level = fields.Integer()
    building = fields.Many2one('recuperacio.building')
    materials = fields.Many2one('recuperacio.material')
    production = fields.Float(string="Production/minute")

