from odoo import models, fields, api


class drive(models.Model):
    _name = 'drive.file'
    _description = 'drive.file'

    name = fields.Char()
    file = fields.Binary()
    user = fields.Many2one('res.users', default=lambda self: self.env.user)
    interested = fields.Many2many('res.users')

    def toggle_interested(self):
        if self.env.user in self.interested:
            self.interested = [(3, self.env.user.id)]
        else:
            self.interested = [(4, self.env.user.id)]


class res_users(models.Model):
    _inherit = 'res.users'

    drive_file_ids = fields.Many2many('drive.file', compute='_get_drive_files')

    
    def _get_drive_files(self):
        for user in self:
            interested = self.env['drive.file'].search([('interested', 'in', user.id)])
            owner = self.env['drive.file'].search([('user', '=', user.id)])
            user.drive_file_ids = interested | owner


class file_wizard(models.TransientModel):
    _name = 'drive.wizard'
    _description = 'File Wizard'

    name = fields.Char()
    file = fields.Binary()

    def create_file(self):
        self.env['drive.file'].create({
            'name': self.name,
            'file': self.file,
            'user': self.env.user.id
        })