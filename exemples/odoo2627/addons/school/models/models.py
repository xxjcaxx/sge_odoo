from odoo import models, fields, api



class student(models.Model):
     _name = 'school.student'
     _description = 'school.student'

     name = fields.Char()
     age = fields.Integer()
     classroom_id = fields.Many2one('school.classroom', string='Classroom', domain="[('capacity', '>', 0)]")
     teacher_ids = fields.Many2many('school.teacher', string='Teachers', related='classroom_id.teacher_ids')

class classroom(models.Model):
     _name = 'school.classroom'
     _description = 'Classrroms of the school'

     name = fields.Char()
     capacity = fields.Integer()
     student_ids = fields.One2many('school.student', 'classroom_id', string='Students')
     teacher_ids = fields.Many2many('school.teacher', string='Teachers')

class teacher(models.Model):
     _name = 'school.teacher'
     _description = 'Teachers of the school'

     name = fields.Char()
     subject = fields.Char()
     classroom_ids = fields.Many2many('school.classroom', string='Classrooms')