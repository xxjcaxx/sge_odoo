# -*- coding: utf-8 -*-
import builtins

import bs4.builder
from odoo import models, fields, api
import math
from odoo.exceptions import ValidationError
import random
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from . import name_generator


class player(models.Model):
    _name = 'roma.player'
    _description = 'Players of Roma Aeterna Game'

    name = fields.Char(required=True)
    avatar = fields.Image(max_width=200, max_height=200)
    citicens = fields.One2many('roma.citicen', 'player')
    cities = fields.Many2many('roma.city', compute='_get_cities')

    def generate_citicen(self):
        for p in self:
            templates = self.env['roma.template'].search([]).ids
            random.shuffle(templates)
            cities = self.env['roma.city'].search([]).ids
            random.shuffle(cities)
            citicen = p.citicens.create({
                "name": name_generator.name_generator(),
                "avatar": self.env['roma.template'].browse(templates[0]).image_small,
                "player": p.id,
                "hierarchy": "1",
                "city": cities[0]
            })

    def _get_cities(self):
        for p in self:
            p.cities = p.citicens.city


class city(models.Model):
    _name = 'roma.city'
    _description = 'Cities'

    name = fields.Char(required=True)
    level = fields.Selection([('1', 'Villa'), ('2', 'Oppidum'), ('3', 'Urbs')], required=True, default='1')
    forum_level = fields.Integer()
    # Desbloca la capacitat de tindre magisters, consul o dictador
    thermae_level = fields.Integer()
    theater_level = fields.Integer()
    circus_level = fields.Integer()
    temple_level = fields.Integer()
    # Els deus ajuden a la lealtat i en la resta de coses

    health = fields.Float()
    loyalty = fields.Float()
    gods = fields.Integer()

    metal = fields.Float(default=1000)
    gold = fields.Float(default=100)
    food = fields.Float(default=10000)

    buildings = fields.One2many('roma.building', 'city')
    available_buildings = fields.Many2many('roma.building_type', compute='_get_available_buildings')
    citicens = fields.One2many('roma.citicen', 'city')
    senate = fields.Many2many('roma.citicen', compute='_get_senate')
    laws = fields.One2many('roma.law', 'city')

    units = fields.One2many('roma.unit', 'city')
    battles_attack = fields.One2many('roma.battle', 'city1')
    battles_defense = fields.One2many('roma.battle', 'city2')
    battles = fields.Many2many('roma.battle', compute='_get_battles')

    def generate_unit(self):
        for c in self:
            if len(c.buildings.filtered(lambda b: b.soldiers_production > 0)) > 0:
                time_to_train = 80 / sum(c.buildings.mapped('soldiers_production'))
                self.env['roma.unit'].create({
                    "name": "Generated Saeculum",
                    "city": c.id,
                    "type": "1",
                    "legionaries": 60,
                    "equites": 20,
                    "training": 0,
                    "time_to_train": time_to_train
                })

    @api.constrains('gods')
    def _check_gods(self):
        for c in self:
            if c.gods > c.temple_level:
                raise ValidationError("You cannot have more than %s gods" % c.temple_level)
            if c.gods < 0:
                raise ValidationError("You cannot have less than 0 gods")

    def update_resources(self):
        for c in self.search([]):
            metal = c.metal
            gold = c.gold
            food = c.food
            for b in c.buildings.filtered(lambda b: b.is_active and b.level >= 1):
                metal += b.metal_production
                gold += b.gold_production
                food += b.food_production
            c.write({"metal": metal, "gold": gold, "food": food})

    def _get_available_buildings(self):
        for c in self:
            c.available_buildings = self.env['roma.building_type'].search([]).filtered(
                lambda b: b.gold_price <= c.gold).ids

    def _get_senate(self):
        for city in self:
            city.senate = city.citicens.filtered(lambda c: c.hierarchy == '4')
            print('************', city.senate)

    def _get_battles(self):
        for city in self:
            city.battles = city.battles_attack + city.battles_defense

    def new_building(self):
        return {
            'type': 'ir.actions.act_window',
            'res_model': 'roma.building_wizard',
            'view_mode': 'form',
            'target': 'new',
            'context': {'city_context': self.id}
        }


class citicen(models.Model):
    _name = 'roma.citicen'
    _description = 'Important Citicen'

    name = fields.Char(required=True)
    avatar = fields.Image(max_width=200, max_height=200)
    player = fields.Many2one('roma.player', required=True)
    hierarchy = fields.Selection(
        [('1', 'Equites'), ('2', 'Patricius'), ('3', 'Magister'), ('4', 'Potestas'), ('5', 'Consul'),
         ('6', 'Dictator')], required=True)
    # Sols pot haver un cónsul o un Dictador per ciutat. Sols hi ha dictador en situació de guerra. Sols hi ha un potestas, que tria als magister
    # Un equites no pot passar a patricio si no el nombra un potestas o té un "triumphus" en una batalla .
    # Un patricio pot ser magister si es guanya Eleccions o amb mèrits militars com un "triumphus" en una batalla o si el nombra un Potestas
    # A partir de magister pots tindre legios
    # Els magister tenen el poder de constriur o llevar edificis i millorar la ciutat
    # Els magister poden arribar a ser potestas si queda un lloc en el senado i és triat pel propi senado a proposta del consul o per molts mèrits militars o de la ciutat
    # A partir de potestas pots participar en el senat i votar lleis
    # A partir de consul pots tindre dictador i més d'una legio
    # Tindre dictador millora molt el rendiment en batalles però es perd en lealtat, salut i producció
    # El senat tria al consul o al dictador entre els potestas, declara guerres a proposta del consul (el dicatdor també pot), canvia lleis
    # El consul proposa entrar en guerra, proposa un candidat a dictador (pot ser ell) i proposa les noves lleis. Un consul declara eleccions per als magisters
    # Tots voten per igual en les eleccions
    city = fields.Many2one('roma.city')
    health = fields.Float(default=100)
    vita = fields.Text(default="")  # Historia del personatge
    experience = fields.Float(default=0)
    battles = fields.Many2many('roma.battle')
    elections = fields.One2many('roma.election_candidate', 'candidate')
    # Sols per als magisters:
    city_buildings = fields.One2many('roma.building', related="city.buildings")
    available_buildings = fields.Many2many('roma.building_type', related="city.available_buildings")
    legios = fields.One2many('roma.unit', 'magister')

    @api.constrains('hierarchy')
    def _check_hierarchy(self):
        for c in self:
            print('a')

    def assign_random_city(self):
        for c in self:
            cities = self.env['roma.city'].search([]).ids
            random.shuffle(cities)
            c.city = cities[0]
            print(c.vita, str(fields.Datetime.now()), str(c.city.name))
            c.vita = str(c.vita) + str(fields.Datetime.now()) + " Is assigned to " + str(c.city.name)


class building_type(models.Model):
    _name = 'roma.building_type'
    _description = 'Type of buildings'

    name = fields.Char()
    food_production = fields.Float()
    soldiers_production = fields.Float()
    gold_production = fields.Float()
    metal_production = fields.Float()
    gold_price = fields.Float()
    icon = fields.Image(max_width=200, max_height=200)

    def build(self):
        for b in self:
            city_id = self._context.get('city_id')
            building = self.env['roma.building'].create({
                "type": b.id,
                "city": city_id,
                "update_percent": 0,
                "level": 0
            })
            building.city.gold -= building.gold_price


class building(models.Model):
    _name = 'roma.building'
    _description = 'Buildings of the cities'

    name = fields.Char(compute='_get_name')
    type = fields.Many2one('roma.building_type', required=True)
    city = fields.Many2one('roma.city', required=True, ondelete="cascade")
    level = fields.Integer(default=0)
    update_percent = fields.Float(default=0)
    food_production = fields.Float(compute='_get_productions')
    soldiers_production = fields.Float(compute='_get_productions')
    gold_production = fields.Float(compute='_get_productions')
    metal_production = fields.Float(compute='_get_productions')
    gold_price = fields.Float(compute='_get_productions')
    icon = fields.Image(related='type.icon')
    is_active = fields.Boolean(compute='_get_is_active')

    @api.depends('type', 'level')
    def _get_productions(self):
        for b in self:
            b.food_production = b.type.food_production + b.type.food_production * math.log(b.level + 1)
            b.soldiers_production = b.type.soldiers_production + b.type.soldiers_production * math.log(b.level + 1)
            b.gold_production = b.type.gold_production + b.type.gold_production * math.log(b.level + 1)
            b.metal_production = b.type.metal_production + b.type.metal_production * math.log(b.level + 1)
            b.gold_price = b.type.gold_price * b.level

    @api.depends('type', 'city')
    def _get_name(self):
        for b in self:
            b.name = 'undefined'
            if b.type and b.city:
                b.name = b.type.name + " " + b.city.name + " " + str(b.id)

    @api.depends('city')
    def _get_is_active(self):
        for b in self:
            b.is_active = True
            if b.food_production < 0 and b.city.food <= abs(b.food_production):
                b.is_active = False
            if b.gold_production < 0 and b.city.gold <= abs(b.gold_production):
                b.is_active = False
            if b.metal_production < 0 and b.city.metal <= abs(b.metal_production):
                b.is_active = False

    def update_level(self):
        for b in self.search([('update_percent', '<', 100)]):
            b.update_percent += 1 / (b.level + 1)
            if (b.update_percent >= 100):
                b.update_percent = 100
                b.level += 1
            print(b.name, b.update_percent)

    def update_building(self):
        for b in self:
            if b.update_percent == 100:
                b.update_percent = 0

    @api.constrains('level')
    def _check_level(self):
        for b in self:
            if b.update_percent != 100 and b.level > 0:
                raise ValidationError("You can't update while updating")


class unit(models.Model):
    _name = 'roma.unit'
    _description = 'Group of soldiers'

    name = fields.Char()
    city = fields.Many2one('roma.city')
    magister = fields.Many2one('roma.citicen', domain=[('hierarchy', '>=', '3')])
    type = fields.Selection([('1', 'Saeculum'), ('2', 'Cohortis'), ('3', 'Legio')])
    #  1 Centuria 80 soldats
    # 2 Cohortis 6 centuries
    # 3 Legio 10 cohortes
    legionaries = fields.Integer()
    equites = fields.Integer()
    parent_unit = fields.Many2one('roma.unit')
    units = fields.One2many('roma.unit', 'parent_unit')
    training = fields.Float(default=1)
    time_to_train = fields.Float(default=0)
    total_soldiers = fields.Integer(compute='_get_total_soldiers')

    @api.depends('legionaries', 'equites', 'units')
    def _get_total_soldiers(self):
        print(self)
        for unit in self:
            total = unit.legionaries + unit.equites
            for subunit in unit.units:
                total = total + subunit.total_soldiers
            unit.total_soldiers = total

    def update_train(self):
        for u in self.search([('time_to_train', '>', 0)]):
            u.time_to_train = u.time_to_train - 1
            if u.time_to_train <= 0:
                u.training += 1


class template(models.Model):
    _name = 'roma.template'
    _description = 'Template Images'

    name = fields.Char()
    type = fields.Char()
    image = fields.Image(max_width=400, max_height=400)
    image_small = fields.Image(related="image", string="ismall", max_width=200, max_height=200)
    image_thumb = fields.Image(related="image", string="ithumb", max_width=100, max_height=100)


class battle(models.Model):
    _name = 'roma.battle'
    _description = 'Battles'

    name = fields.Char()
    start = fields.Datetime(default=lambda self: fields.Datetime.now())
    end = fields.Datetime(compute='_get_data_end')
    total_time = fields.Integer(compute='_get_data_end')
    remaining_time = fields.Char(compute='_get_data_end')
    progress = fields.Float(compute='_get_data_end')
    city1 = fields.Many2one('roma.city', domain="[('id','!=',city2)]")
    city2 = fields.Many2one('roma.city', domain="[('id','!=',city1)]")
    units1 = fields.Many2many('roma.unit', domain="[('city','=',city1),('training','>',0)]")
    equites1 = fields.Many2many('roma.citicen', domain="[('city','=',city1),('hierarchy','=','1')]")

    def update_battles(self):
        for b in self.search([]):
            if fields.Datetime.now() > b.end:
                print(b.name)

    @api.depends('start')
    def _get_data_end(self):
        for b in self:
            date_start = fields.Datetime.from_string(b.start)
            date_end = date_start + timedelta(hours=2)
            b.end = fields.Datetime.to_string(date_end)
            b.total_time = (date_end - date_start).total_seconds() / 60
            remaining = relativedelta(date_end, datetime.now())
            b.remaining_time = str(remaining.hours) + ":" + str(remaining.minutes) + ":" + str(remaining.seconds)
            passed_time = (datetime.now() - date_start).total_seconds()
            b.progress = (passed_time * 100) / (b.total_time * 60)
            if b.progress > 100:
                b.progress = 100
                b.remaining_time = '00:00:00'

    @api.constrains('city1', 'city2')
    def _check_cities(self):
        for b in self:
            if b.city1.id == b.city2.id:
                raise ValidationError("One city can attack itself")

    @api.constrains('city1', 'units1')
    def _check_units(self):
        for b in self:
            for u in b.units1:
                if u.city.id != b.city1.id:
                    raise ValidationError("All units have to be from city 1")
                if u.training < 1:
                    raise ValidationError("All units have to be trained")


class election(models.Model):
    _name = 'roma.election'
    _description = 'election'

    name = fields.Char()
    candidates = fields.One2many('roma.election_candidate', 'election')
    date_end = fields.Datetime()


class election_candidate(models.Model):
    _name = 'roma.election_candidate'
    _description = 'election candidate'

    name = fields.Char()
    candidate = fields.Many2one('roma.citicen')
    election = fields.Many2one('roma.election')
    votes = fields.Integer()


class law(models.Model):
    _name = 'roma.law'
    _description = 'law'

    name = fields.Char()
    city = fields.Many2one('roma.city')
    # Les lleis modifiquen qualsevol norma de les ciutats
    model_condition = fields.Many2one('ir.model', domain="[('model','like','roma.%')]")
    field_condition = fields.Many2one('ir.model.fields', domain="[('model_id','=',model_condition)]")
    domain_comparator = fields.Selection([('=', '='), ('>', '>'), ('like', 'like')])
    comparation_condition = fields.Char()

    model_result = fields.Many2one('ir.model', domain="[('model','like','roma.%')]")
    field_result = fields.Many2one('ir.model.fields', domain="[('model_id','=',model_result)]")
    field_modification = fields.Selection([('add', 'Add'), ('assign', 'Assign'), ('addm2m', 'Add Many2many')])

    # result = fields.Char()

    def apply_laws(self):
        for l in self.search([]):
            city = l.city
            print(l.domain_comparator, city[l.field_condition.name], l.comparation_condition)
            if l.domain_comparator == '=':
                if str(city[l.field_condition.name]) == str(l.comparation_condition):
                    print(l)


class building_wizard(models.TransientModel):
    _name = 'roma.building_wizard'

    def _get_default_city(self):
        return self._context.get('city_context')

    name = fields.Char(compute='_get_name')
    type = fields.Many2one('roma.building_type', required=True)
    city = fields.Many2one('roma.city', required=True, default=_get_default_city)
    icon = fields.Image(related='type.icon')

    @api.depends('type', 'city')
    def _get_name(self):
        for b in self:
            b.name = 'undefined'
            if b.type and b.city:
                b.name = b.type.name + " " + b.city.name + " " + str(b.id)

    def create_building(self):
        self.env['roma.building'].create({
            "type": self.type.id,
            "city": self.city.id
        })


class battle_wizard(models.TransientModel):
    _name = 'roma.battle_wizard'

    def _get_default_city(self):
        return self._context.get('city_context')

    state = fields.Selection([
        ('cities', "Cities Selection"),
        ('units', "Units Selection"),
        ('dates', "Dates Selection"),
    ], default='cities')

    name = fields.Char()
    start = fields.Datetime(default=lambda self: fields.Datetime.now())

    city1 = fields.Many2one('roma.city', readonly=True, default=_get_default_city, domain="[('id','!=',city2)]")
    city2 = fields.Many2one('roma.city', domain="[('id','!=',city1)]")
    available_units = fields.Many2many('roma.battle_wizard_unit', compute='_get_units')
    units1 = fields.Many2many('roma.battle_wizard_unit', readonly=True)

    # equites1 = fields.Many2many('roma.citicen', domain="[('city','=',city1),('hierarchy','=','1')]")

    @api.depends('city1')
    def _get_units(self):
        available_units = self.env['roma.battle_wizard_unit']

        if len(self.city1) > 0:
            city_available_units = self.city1.units;
            for a_unit in city_available_units:
                selected = False
                if (len(self.units1.filtered(lambda u: u.unit.id == a_unit.id)) > 0):
                    selected = True
                available_units = available_units + self.env['roma.battle_wizard_unit']\
                    .create({"unit": a_unit.id, "selected": selected})
            self.available_units = available_units

    def create_battle(self):
        min_date = fields.Datetime.from_string(fields.Datetime.now()) - timedelta(minutes=5)
        if (self.start < min_date):
            self.start = fields.Datetime.now()
        self.env['roma.battle'].create({
            "name": self.name,
            "start": self.start,
            "city1": self.city1.id,
            "city2": self.city2.id
        })

    def action_previous(self):
        if (self.state == 'units'):
            self.state = 'cities'
        elif (self.state == 'dates'):
            self.state = 'units'
        return {
            'type': 'ir.actions.act_window',
            'name': 'Launch battle wizard',
            'res_model': self._name,
            'view_mode': 'form',
            'target': 'new',
            'res_id': self.id,
            'context': self._context
        }

    def action_next(self):
        if (self.state == 'cities'):
            if(len(self.city2)>0):
                self.state = 'units'
            else:
                return {
                    'type': 'ir.actions.client',
                    'tag': 'display_notification',
                    'params': {
                        'message': 'City 2 not selected',
                        'type': 'info',  # types: success,warning,danger,info
                        'sticky': False,
                    }
                }
        elif (self.state == 'units'):
            self.assign_multiple()
            self.state = 'dates'
        print(self)
        return {
            'type': 'ir.actions.act_window',
            'name': 'Launch battle wizard',
            'res_model': self._name,
            'view_mode': 'form',
            'target': 'new',
            'res_id': self.id,
            'context': self._context
        }

    def assign_multiple(self):
       # selected = self.available_units.filtered(lambda u: u.selected == True)
       # print("SELECTED", selected, self._origin.available_units.mapped('selected'))
        context_available_units = self._context.get('wizard_available_units')[0][2]
        selected = self.env['roma.battle_wizard_unit'].browse(context_available_units).filtered(lambda u: u.selected == True)
        print("context selecte", selected)
        self.units1 = selected.ids
        return {
            'type': 'ir.actions.act_window',
            'name': 'Launch battle wizard',
            'res_model': self._name,
            'view_mode': 'form',
            'target': 'new',
            'res_id': self.id,
            'context': self._context
        }

    @api.onchange('start')
    def _onchange_start(self):
        min_date = fields.Datetime.from_string(fields.Datetime.now()) - timedelta(minutes=5)
        print(min_date, fields.Datetime.now())
        if (self.start < min_date):
            self.start = fields.Datetime.now()
            return {
                'warning': {'title': "Warning", 'message': "Min date", 'type': 'notification'},
            }


class battle_wizard_unit(models.TransientModel):
    _name = 'roma.battle_wizard_unit'

    unit = fields.Many2one('roma.unit')

    name = fields.Char(related='unit.name')
    city = fields.Many2one('roma.city', related='unit.city')
    type = fields.Selection(related='unit.type')
    legionaries = fields.Integer(related='unit.legionaries')
    equites = fields.Integer(related='unit.equites')
    parent_unit = fields.Many2one('roma.unit', related='unit.parent_unit')
    total_soldiers = fields.Integer(related='unit.total_soldiers')

    selected = fields.Boolean()

    def assign_to_battle(self):
        wizard = self._context.get('battle_wizard_context')

        wizard = self.env['roma.battle_wizard'].browse(wizard)
        wizard.write({"units1": [(4, self.id)]})

        return {
            'type': 'ir.actions.act_window',
            'name': 'Launch battle wizard',
            'res_model': wizard._name,
            'view_mode': 'form',
            'target': 'new',
            'res_id': wizard.id,
            'context': wizard._context
        }
