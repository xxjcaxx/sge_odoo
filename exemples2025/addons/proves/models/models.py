# -*- coding: utf-8 -*-

from odoo import models, fields, api


class student(models.Model):
    _name = 'proves.student'
    _description = 'Estudiants'

    name = fields.Char(required=True)
    year = fields.Integer()
    photo = fields.Image(max_width=200, max_height=200)
    classroom_id = fields.Many2one('proves.classroom', ondelete='set null')
    topics = fields.One2many('proves.mark','student')
    floor = fields.Integer(related='classroom_id.floor')

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

    name = fields.Char()
    mark = fields.Integer()
    student = fields.Many2one('proves.student')
    topic = fields.Many2one('proves.topic')


class topic(models.Model):
    _name = 'proves.topic'
    _description = 'Assignatures'

    name = fields.Char(required=True)
    description = fields.Text()
    course = fields.Selection([('1','Primer'),('2','Segon')])
    teacher = fields.Many2one('proves.teacher',ondelete='set null')
    students = fields.One2many('proves.mark','topic')