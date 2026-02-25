# -*- coding: utf-8 -*-
from odoo import http


class SkillsDescription(http.Controller):

     @http.route('/skills_description/skills_types', auth='public')
     def list(self, **kw):
           name = kw['name']
           record = http.request.env['hr.skill.type'].sudo().search([("name","=",name)])
           return http.request.make_json_response(
               record.read(), 
               headers=None, 
               cookies=None, 
               status=200)

