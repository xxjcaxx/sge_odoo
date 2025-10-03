# -*- coding: utf-8 -*-

from odoo import models, fields, api
import random


"""
El nom del model mark ha de ser computat per indicar l’alumne i l’assignatura
Fer un nou camp computat a partir de l’any de naixement per treure l’edat. 
Treue la quantitat d’assignatures d’un alumne i d’un professor
Fer que la nota per defecte al crear una nota en un alumne siga un número aleatori
"""

class student(models.Model):
    _name = 'proves.student'
    _description = 'Estudiants'

    name = fields.Char(required=True)
    year = fields.Integer(default=lambda self: random.randint(2000,2015))
    age = fields.Integer(compute="_get_age")
    photo = fields.Image(max_width=200, max_height=200)
    classroom_id = fields.Many2one('proves.classroom', ondelete='set null')
    topics = fields.One2many('proves.mark','student')
    qua_topics = fields.Integer(compute = "_get_median_mark", string="Topics Quantity")
    floor = fields.Integer(related='classroom_id.floor')
    median_mark = fields.Float(compute='_get_median_mark')

    @api.depends('topics')
    def _get_median_mark(self):
        for student in self:
            student.median_mark = 0
            student.qua_topics = len(student.topics)
            if len(student.topics) > 0:
                median = 0
                for topic in student.topics:
                    median+= topic.mark
                student.median_mark = median / len(student.topics)

        
    @api.depends('year')
    def _get_age(self):
        for s in self:
            s.age = int(fields.Date.to_string(fields.Date.today()).split('-')[0]) - s.year

class teacher(models.Model):
    _name = 'proves.teacher'
    _description = 'Professors'

    name = fields.Char(required=True)
    speciality = fields.Char()
    topics = fields.One2many('proves.topic','teacher')
    classrooms = fields.Many2many('proves.classroom')
    tutories = fields.Many2many(comodel_name='proves.classroom', # El model en el que es relaciona
                            relation='teacher_tutor_classrom', # (opcional) el nom del la taula en mig
                            column1='teacher_id', # (opcional) el nom en la taula en mig de la columna d'aquest model
                            column2='classroom_id')  # (opcional) el nom de la columna de l'altre model.
    course = fields.Char()


class classroom(models.Model):
    _name = 'proves.classroom'
    _description = 'Classes'

    name = fields.Char()
    floor = fields.Integer()
    temperature = fields.Float()
    student_list = fields.One2many('proves.student','classroom_id')
    teachers = fields.Many2many('proves.teacher')
    tutors = fields.Many2many(comodel_name='proves.teacher', # El model en el que es relaciona
                            relation='teacher_tutor_classrom', # (opcional) el nom del la taula en mig
                            column1='classroom_id', # (opcional) el nom en la taula en mig de la columna d'aquest model
                            column2='teacher_id')  # (opcional) el nom de la columna de l'altre model.


class mark(models.Model):
    _name = 'proves.mark'
    _description = 'notes'

    name = fields.Char(compute="_get_mark_name")
    mark = fields.Integer(default=lambda self: random.randint(0,10))
    student = fields.Many2one('proves.student')
    topic = fields.Many2one('proves.topic')

    @api.depends('student','topic')
    def _get_mark_name(self):
        for m in self:
            m.name = str(m.student.name) + " " + str(m.topic.name)


class topic(models.Model):
    _name = 'proves.topic'
    _description = 'Assignatures'

    name = fields.Char(required=True)
    description = fields.Text()
    course = fields.Selection([('1','Primer'),('2','Segon')])
    teacher = fields.Many2one('proves.teacher',ondelete='set null', domain="[('course', '=', course)]")
    students = fields.One2many('proves.mark','topic')