from datetime import timedelta

from odoo import models, fields, api


class esdeveniment(models.Model):
    _name = 'venda_entrades_segures.esdeveniment'
    _description = 'venda_entrades_segures.esdeveniment'

    name = fields.Char()
    preu_base = fields.Float(string='Preu Base')
    data_limit_acces = fields.Datetime(string='Data Límite d\'Accés')



class tiquet(models.Model):
    _name = 'venda_entrades_segures.tiquet'
    _description = 'venda_entrades_segures.tiquet'

    name = fields.Char()
    comprador_id = fields.Many2one('res.partner', string='Comprador')
    esdeveniment_id = fields.Many2one('venda_entrades_segures.esdeveniment', string='Esdeveniment')
    preu_final = fields.Float(string='Preu Final', store=True, readonly=True, compute='_compute_preu_final')
    codi_seguretat = fields.Char(string='Codi de Seguretat', compute='_compute_codi_seguretat')
    data_limit_acces = fields.Datetime(string='Data Límite d\'Accés', compute='_compute_data_limit_acces')
    foto_comprador = fields.Image(string='Foto del Comprador', compute='_compute_foto_comprador')
    clausules_legals = fields.Html(string='Clàusules Legals', compute='_compute_clausules_legals')
    etiquetes_ids = fields.Many2many('venda_entrades_segures.etiqueta', relation='tiquet_etiqueta_rel', string='Etiquetes')
    entrades_relacionades_ids = fields.Many2many('venda_entrades_segures.tiquet', relation='tiquet_relacionat_rel', string='Entrades Relacionades')

    @api.depends('esdeveniment_id')
    def _compute_preu_final(self):
        for record in self:
            if record.esdeveniment_id:
                record.preu_final = record.esdeveniment_id.preu_base * 1.10  # Aplicar un increment del 10%
            else:
                record.preu_final = 0.0

    @api.depends('comprador_id', 'esdeveniment_id')
    def _compute_codi_seguretat(self):
        for record in self:
            if record.comprador_id and record.esdeveniment_id:
                record.codi_seguretat = f"{record.comprador_id.name}-{record.esdeveniment_id.id}"
            else:
                record.codi_seguretat = ""

    @api.depends('esdeveniment_id')
    def _compute_data_limit_acces(self):
        for record in self:
            if record.esdeveniment_id and record.esdeveniment_id.data_limit_acces:
                record.data_limit_acces = record.esdeveniment_id.data_limit_acces - timedelta(hours=2)
            else:
                record.data_limit_acces = False

        

    @api.depends('comprador_id')
    def _compute_foto_comprador(self):
        for record in self:
            if record.comprador_id:
                record.foto_comprador = record.comprador_id.image_1920
            else:
                record.foto_comprador = False

    @api.depends('comprador_id')
    def _compute_clausules_legals(self):
        for record in self:
            if record.comprador_id:
                record.clausules_legals = f"<p>Clàusules legals per a {record.comprador_id.name}:</p><ul><li>1. <strong>No es permet la revenda de les entrades.</strong></li><li>2. Les entrades són personals i intransferibles.</li><li>3. El comprador és responsable del compliment de les normes de l'esdeveniment.</li></ul>"
            else:
                record.clausules_legals = False


class etiqueta(models.Model):
    _name = 'venda_entrades_segures.etiqueta'
    _description = 'venda_entrades_segure.etiqueta'

    name = fields.Char()
    tiquet_ids = fields.Many2many('venda_entrades_segures.tiquet', relation='tiquet_etiqueta_rel', string='Tiquets')