# -*- coding: utf-8 -*-

from odoo import models, fields, api


class skills_description(models.Model):
    #_name = 'skills_description.skills_description'
    _inherit = 'hr.skill'


    description = fields.Html()


class skill_transient(models.TransientModel):
    _name = 'skills_description.skill_transient'
    name = fields.Char()
    skill_type_wizard_id = fields.Many2one('skills_description.skill_type_wizard')

class skill_type_wizard(models.TransientModel):
    _name = 'skills_description.skill_type_wizard'

    name = fields.Char()
    skills_ids = fields.One2many("skills_description.skill_transient","skill_type_wizard_id")
    

    def create_skill_type(self):

        color = self.env.context.get('color_context')
        
        skill_type = self.env['hr.skill.type'].create({
            "name": self.name,
            "color": color
        })

        for skill_id in self.skills_ids:
            self.env['hr.skill'].create({
                "name": skill_id.name,
                "skill_type_id": skill_type.id
            })
        return {
            'name': 'New Skill Type',
            'view_type': 'form',
            'view_mode': 'form',   # Pot ser form, tree, kanban...
            'res_model': 'hr.skill.type', # El model de destí
            'res_id': skill_type.id,       # El id concret per obrir el form
            'context': self._context,   # El context es pot ampliar per afegir opcions
            'type': 'ir.actions.act_window',
            'target': 'current',  # Si ho fem en current, canvia la finestra actual.
        }