# -*- coding: utf-8 -*-

from odoo import models, fields, api


class nomines(models.Model):
    _name = 'nomines.nomines'
    _description = 'nomines.nomines'

    name = fields.Char()
    start_date = fields.Datetime()
    end_date = fields.Datetime()
    total_amount = fields.Float()
    employee_id = fields.Many2one('hr.employee', string='Employee')
    conceptes_ids = fields.Many2many('nomines.conceptes')
    state = fields.Selection([
        ('draft', 'Draft'),
        ('confirmed', 'Confirmed'),
        ('paid', 'Paid'),
    ], default='draft')

    def add_basic_concept(self):
        basic_concept = self.env.ref('nomines.concepte_basic')
        print("Basic Concept:", basic_concept)
        self.write({'conceptes_ids': [(4, basic_concept.id)]})


class conceptes(models.Model):
    _name = 'nomines.conceptes'
    _description = 'nomines.conceptes'

    name = fields.Char()
    type = fields.Selection([
        ('basic', 'Basic Salary'),
        ('incentive', 'Incentive'),
        ('extra', 'Extra Hours'),
    ], default='basic')
    nomina_id = fields.Many2many('nomines.nomines')



class employees(models.Model):
    _inherit = 'hr.employee'

    nomines_ids = fields.One2many('nomines.nomines', 'employee_id', string='Nomines')
    contract_type = fields.Selection([
        ('full_time', 'Full Time'),
        ('part_time', 'Part Time'),
        ('internship', 'Internship'),
    ], string='Contract Type')
    base_salary = fields.Float()
    nomines_pending = fields.Many2many('nomines.nomines', compute='_compute_nomines_pending')

    @api.depends('nomines_ids')
    def _compute_nomines_pending(self):
        for concept in self:
            concept.nomines_pending = concept.nomines_ids.filtered(lambda n: n.state != 'paid')



