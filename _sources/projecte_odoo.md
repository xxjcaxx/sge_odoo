# Projecte amb Odoo

Per practicar tots els conceptes d'Odoo aquest capítol repasa les tasques per crear un projecte sencer. 

Aquest projecte en concret es per a gestionar un campionat de natació. Es gestionarà tant l'inscripció com les dades pròpies de la competició. 

## Primers models

Després de crear el mòdul:

  odoo scaffold swim .

Arranquem Odoo i l'instal·lem. Sols en eixe moment ens posarem a crear els models:

```python
# -*- coding: utf-8 -*-

from odoo import models, fields, api


class swimmer(models.Model):
     _name = 'swim.swimmer'
     _description = 'Swimmers'

     name = fields.Char()
     year = fields.Integer()
     age = fields.Integer() # computed
     federation_code = fields.Integer() # Default computed
     club = fields.Many2one('swim.club')

class club(models.Model):
     _name = 'swim.club'
     _description = 'Clubs'

     name = fields.Char()
     swimmers = fields.One2many('swim.swimmer','club')
     # categories = como many2many pero computado totalmente

class category(models.Model):
     _name = 'swim.category'
     _description = 'Categories'

     name = fields.Char()
     min_age = fields.Integer()
     max_age = fields.Integer()
     gender = fields.Selection([('f','Femenine'),('m','Masculine')])



```
 
