# Wizards

Els wizards d\'Odoo permeten fer un asistent
interactiu per a que l'usuari complete una tasca. Es tracta simplement d'un formulari emergent que va demanant dades i ajundant a l'usuari i en el que les dades són temporals.

Els wizards en Odoo se fan a partir de models que estenen la classe
**TransientModel** en compte de *Model*. Aquesta classe és molt
pareguda, però:

- Les dades no són persistents, encara que es guarden temporalment en la base de dades.
- Els records dels wizards poden tindre referències Many2one o Many2many amb el records dels models normals, però no al contrari.
- Els records dels models normals poden tindre One2many a Wizards, però cada cert tems s\'eliminen.

En realitat, no estem fent res molt diferent al que fem en Odoo a
exepció del **TransientModel**. Es tracta de crear formularis i accions
igual que podem crear-los per a altres propòsits. Un Wizard és un
conjunt de tècniques que s\'utilitzen conjuntament sovint. Així, el
cicle de vida d\'un wizard serà el següent:

- Un botó o el menú de dalt de la vista crida a un **action** que
    mostrarà el wizard. Por ser cridat de 4 maneres:
  - Per un action ja preexistent en la base de dades amb **%()d** i
        un botó de tipus action.
  - Per un action ja preexistent que tinga **binding_model** i per
        tant isca en el menú de dalt d\'una vista en eixe model.
  - Per un action generat per Python i retornat per una funció. (En
        Odoo totes les funcions cridades des de la vista poden retornar
        un action que després el client executa).
  - La més exòtica és per un action preexistent però obtingut en una
        funció Python i retornat per aquesta. No és molt freqüent, però
        pot ser l\'única opció si la funció pot o no retornar un wizard
        i la cridada al mateix es vol definir una vegada només.
- Eixe action, en els wizards, sol obrir una finestra modal
    (target=\"new\") on es mostren alguns fields del **TransientModel**.
- La finestra conté un formulari que sol tindre un botó per a enviar,
    crear o el que es necessite i un especial **Cancel** que té la seua
    sintaxi específica.
- Els wizards solen ser assistents que tenen botos de **next**,
    **back** per exemple. Eixe comportament s\'implementa amb:
  - Un field de tipus **selection** anomenat **state** (és important
        el nom).
  - Un **header** en el formulari amb un widget **statusbar** per
        mostrar el progrés.
  - Els botons anterior i següent que criden a funcions del
        TransientModel.
  - Aquestes funcions canvien el field **state** i retornen un
        action del mateix wizard per refrescar-lo i que no es tanque.
  - El formulari té groups o field que es mostren o s\'oculten en
        funció del field **state**.
- En cas de tindre un wizard complex en el que omplir Many2many o
    One2many, tal vegada es necessiten més transientModels per fer
    relacions. No es poden fer relacions x2many amb models normals.
- Finalment, el wizard acabarà creant o modificant alguns models
    permanent de la base de dades. Això es fa en una funció. Eixa funció
    pot retornar un action per mostrar les instàncies creades o per
    refrescar la vista que l\'ha cridat.

## Wizard bàsic

A continuació anem a veure un exemple de wizard que sols mostra un
formulari i crea una instància d\'un model a partir de les dades del
formulari:

``` python
class wizard(models.TransientModel):
     _name = 'mmog.wizard'
     def _default_attacker(self):
         return self.env['mmog.fortress'].browse(self._context.get('active_id')) # El context conté, entre altre coses, 
                                                                                 #el active_id del model que està obert.
     fortress_attacker = fields.Many2one('mmog.fortress',default=_default_attacker)
     fortress_target = fields.Many2one('mmog.fortress')
     soldiers_sent = fields.Integer(default=1)

     def launch(self):
       if self.fortress_attacker.soldiers >= self.soldiers_sent:
          self.env['mmog.attack'].create({'fortress_attacking':self.fortress_attacker.id,
                                          'fortress_defender':self.fortress_target.id,
                                          'data':fields.datetime.now(),'soldiers_sent':self.soldiers_sent})
       return {}
```

En el python cal observar la classe de la que hereta (`TransientModel`). També el default, que
extrau el **active_id** del form que a llançat el wizard i el mètode que
és cridat pel botó de la vista.

``` xml
        <record model="ir.ui.view" id="wizard_mmog_fortress_view">
            <field name="name">wizard.mmog.fortress</field>
            <field name="model">mmog.wizard</field>
            <field name="arch" type="xml">
                <form string="Select fortress">
                    <group>
                        <field name="fortress_attacker"/>
                        <field name="fortress_target"/>
                        <field name="soldiers_sent"/>
                    </group>
                    <footer>
                        <button name="launch" type="object"
                                string="Launch" class="oe_highlight"/>
                        or
                        <button special="cancel" string="Cancel"/>
                    </footer>

                </form>
            </field>
        </record>

          <record id="launch_mmog_fortress_wizard" model="ir.actions.act_window">
            <field name="name">Launch attack</field>
            <field name="res_model">mmog.wizard</field>
            <field name="view_mode">form</field>
            <field name="target">new</field>
            <field name="binding_model_id" ref="model_mmog_fortress"/>
     
```

En la vista, tenim creat un form normal amb dos botons. Un d\'ells és
especial per a cancel·lar el wizard. L\'altre crida al mètode. També
s\'ha creat un action indicant el **src_model** sobre el que treballa i
el model del wizard que utilitza. Els action que criden a wizard tenen
l\'atribut **target** a **new** per a que llance una finestra emergent.

```{tip}
`binding_model` és el model on es pot llançar el wizard. Amb això només ja apareix en el menú superior d'accions. Però podem fer un botó que el cride de forma més intuïtiva.
```

``` xml
 <button name="%(launch_mmog_fortress_wizard)d" type="action" string="Launch attack" class="oe_highlight" />
```

Si volem, podem ficar un botó que cride al action del wizard. Observem
la sintaxi del name, que és igual sempre que el button siga de tipus
action, ja que és l\'anomenat **XML id**.

Una altra opció és fer que el botó siga de tipus `object` i que la funció retorne un action com el creat anteriorment:

```python
def launch_mmog_fortress_wizard(self):
    return {
        'name': 'Launch attack',
        'type': 'ir.actions.act_window',
        'res_model': 'mmog.wizard',
        'view_mode': 'form',
        'target': 'new',
        'context': self._context,
    }
```

## Wizard amb assistent

En aquest exemple anem a fer un wizard amb assistent. Un assistent va demanant les dades poc a poc i autocompletant o indicant a l'usuari l'ordre en el que ha d'introduir les dades. És útil quan es tracta de formularis complexos amb molts camps que depenen d'altres.

Per començar, cal
crear un camp **state** tipus `Selection` amb varis valors possibles i el primer per defecte:

``` python
    state = fields.Selection([
        ('pelis', "Movie Selection"),
        ('dia', "Day Selection"),                                                                        
      ], default='pelis')

          
    def next(self):
        if self.state == 'state1':
            self.state = 'state2'
        return {
            'type': 'ir.actions.act_window',
            'res_model': self._name,
            'res_id': self.id,
            'view_mode': 'form',
            'target': 'new',
        }

    def previous(self):
        if self.state == 'player':
            self.state = 'building'
        return {
            'type': 'ir.actions.act_window',
            'res_model': self._name,
            'res_id': self.id,
            'view_mode': 'form',
            'target': 'new',
        }
```

I uns botons que van fent que passe d\'un estar a un altre:

``` xml
                    <header>
                        <button name="action_pelis" type="object"
                                string="Reset to movie selection"
                                invisible = "state in ['pelis']"/>
                        <button name="action_dia" type="object"
                                string="Select dia" invisible = "state in ['dia']"
                                class="oe_highlight"/>
                        <field name="state" widget="statusbar"/>
                    </header>

                    <group invisible = "state in ['dia']">
                        <field name="cine"/>
                        <field name="pelicules"/>
                    </group>
                    <group invisible = "state in ['pelis']">
                        <field name="dia"/>
                    </group>
```

Després es pot fer que el formulari tinga un aspecte diferent depèn del
valor de **state**.

```{tip}
En l'anterior exemple els botons per a passar al següent estat s'oculten. Si volem deshabilitar-los podem crear un duplicat amb els states inversos i amb la classe "oe_highlight disabled"
```

Els wizards poden tornar a recarregar la vista des de la que són cridats o poden retornar un action per carregar qualsevol vista, per exemple una del registre que s'ha creat:

``` python
return {
    'name': 'Reserves',
    'view_type': 'form',
    'view_mode': 'form',   # Pot ser form, tree, kanban...
    'res_model': 'wizards.reserves', # El model de destí
    'res_id': reserva.id,       # El id concret per obrir el form
   # 'view_id': self.ref('wizards.reserves_form') # Opcional si hi ha més d'una vista posible.
    'context': self._context,   # El context es pot ampliar per afegir opcions
    'type': 'ir.actions.act_window',
    'target': 'current',  # Si ho fem en current, canvia la finestra actual.
}
```

## Wizard amb dades per context

En ocasions, necessitem que el wizard obtinga informació de qui l\'ha
cridat. En els exemples hem vist que obtenim el active_id, és a di, el
registre del que ha sigut cridat, amb:

``` python
  self._context.get('active_id')
```

El traguem del context perquè s\'envia automàticament per Odoo. Però pot
ser que necessitem altres coses, com el *parent.id* o el valor d\'un
altre field, per exemple. Per a enviar informació extra al wizard, podem
afegir coses al context en el action o en el botó que el crida.

``` xml
  <button name="%(negocity.travel_wizard_action)d"ç
          type="action" string="Create Travel"
          context="{'player_context': parent.id, 'city_context': active_id}"
          class="oe_highlight"
  />
```

Eixa informació pot ser llegida amb aquestes instruccions:

``` python
 player = self.env.context.get('player_context')
 city = self.env.context.get('city_context')
```

## X2many en Wizards

Els **Many2one** en wizards són simples, ja que es tracta d\'una relació
de dins del wizard cap a un model permanent. El problema està en els
**One2many** i els **Many2many**. Aquestes relacions impliquen que hi ha
algun model que apunta al **transientmodel** del wizard. Eixe tipus de
relacions són impossibles o no recomanables, aleshores cal crear altres
`transientmodels` auxiliars que representen als originals per
implementar les relacions.

Les relacions `Many2many` entre un TransientModel i un model normal són interessants unidireccionalment, és a dir, al `TransientModel` es pot veure i utilitzar la llista, però no té sentit aquesta llista al model normal si al final es va a esborrar. Odoo manté durant un temps el model per al wizard y al esborrar, també elimina les relacions a la taula intermèdia.

Per tant, si durant el wizard es va a necessitar manipular llistes, pot ser recomanable fer un model transitori també per a simular el model en el que es fa la relació final.

### Amb One2many

En el següent exemple anem a veure cóm implementar un wizard per a un
viatge en el que tindrem una llista de ciutats disponibles en funció
d\'un origen i unes carreteres. Observem primer el transientModel de
**travel**:

``` python
class travel_wizard(models.TransientModel):
    _name = 'negocity.travel_wizard'
    _description = 'Wizard of travels'

    def _get_origin(self):
        city = self.env.context.get('city_context')
        return city

    name = fields.Char()
    origin = fields.Many2one('negocity.city', default = _get_origin)
    cities_available = fields.One2many('negocity.city_transient','wizard')
    destiny = fields.Many2one('negocity.city')  # filtrat
```

Com es veu, obté la ciutat d\'origen per context i cal filtrar les
ciutats disponibles per al destí en funció d\'un field One2many que
tenim que omplir amb la informació de l\'origen.

```{tip}
En realitat és millor fer-ho en un Many2many, després ho emplicarem
```

Mirem també el transientModel de les ciutats per a cities_available:

``` python
class city_transient(models.TransientModel):
    _name = 'negocity.city_transient'

    city = fields.Many2one('negocity.city')
    wizard = fields.Many2one('negocity.travel_wizard')
```

Aquest model temporal sols fa d\'intermediari entre la ciutat real i el
wizard.

Ara anem a fer que, al canviar la ciutat d\'origen, es modifique la
llista de ciutats disponibles:

``` python
@api.onchange('origin')
    def _onchange_origin(self):
        if len(self.origin)>0:
            roads_available = self.origin.roads
            cities_available = roads_available.city_1 + roads_available.city_2 - self.origin
            self.cities_available.unlink()
            for city in cities_available:
                self.env['negocity.city_transient'].create({'city': city.id, 'wizard': self.id})
            return {
            }
```

Encara que no entra dins del tema dels wizards, la manera en la que
troba les ciutats disponibles és interessant per l\'ús d\'operacions de
conjunts en recordsets.

Com es veu, el que es tracta és d\'eliminar les altres relacions i crear
noves. Com que mai estem tractant en ciutats de veritat, no passa res en
fer *unlink()*. Després es crea un nou registre temporal per cada ciutat
de les noves.

Podem aprofitar la llista de ciutats disponibles per fer un filtre en la
vista en el field **destiny**. Per a fer aixó tenim algunes opcions ja
tractades:

Observem la sintaxi en la que es crea un diccionari amb **dict()**
concatenant el context amb dos nous atributs, el de les ciutats i
l\'origen. El context enviat tindrà aquestes dades i seran accessibles
tant pel model com per la vista. Amb aquesta informació, la vista pot
aplicar el filtre:

``` xml
<field name="destiny"
    domain = "[('id','in',context.get('cities_available_context',[]))]"
    attrs="{'readonly': [('origin', '=', False)]}"/>
```

Aprofita la funció **context.get** de QWeb per obtindre el context i
aplicar el filtre.

### Amb Many2many

Anem a veure el mateix exemple implementat en **Many2many computed**. En
primer lloc, la definició del field:

``` python
 cities_available = fields.Many2many('negocity.city_transient', compute="_get_cities_available")
```

Aquest field necessita una funció **compute**:

``` python
    @api.depends('origin')
    def _get_cities_available(self):
        cities = self.env['negocity.city_transient']
        self.cities_available = cities

        if len(self.origin)>0:
            roads_available = self.origin.roads
            cities_available = roads_available.city_1 + roads_available.city_2 - self.origin
            for city in cities_available:
               cities = cities + self.env['negocity.city_transient'].create({'city': city.id, 'wizard': self.id})

            self.cities_available = cities
```

Aquesta implementació simplifica fer el filtre, ja que es tracta d\'un
field computat que es pot recalcular cada vegada que es reinicia el
formulari.

De vegades volem utilitzar aquesta llista computada per fer un botó que
ens permet seleccionar. Si fem el botó d\'aquesta manera:

``` xml
   <button name="select" type="object" string="Select" class="oe_highlight" context="{'travel_wizard_context': parent.id}"/>
```

Podem implementar la funció seüent:

``` python
    def select(self):
        road_available = self.wizard.origin.roads & self.city.roads
        wizard = self._context.get('travel_wizard_context')
        wizard = self.env['negocity.travel_wizard'].browse(wizard)
        wizard.write({'destiny': self.city.id,'road': road_available.id})

        return {
            'name': 'Negocity travel wizard action',
            'type': 'ir.actions.act_window',
            'res_model': self.wizard._name,
            'res_id': self.wizard.id,
            'view_mode': 'form',
            'target': 'new',
            'context': wizard._context
        }
```

## Onchange en Wizards

En principi els Onchange funcionen igual que sempre. És a dir, poden
modificar el valor dels fields o retornar un warning. No
obstant, cal indicar que Onchange funciona sobre un record virtual còpia
del record real en el que treballa el wizard. Així, quan fa un canvi,
sols afecta a la vista. Això no és cap problema quan fem un formulari
normal, però els wizards tenen varis estats (next, state\...) i el canvi
d\'estat provoca recrear la vista de nou per mitjà d\'un action. Eixos
canvis desapareixen. Si volem que Onchange modifique realment el record
del wizard i eixe canvi es quede, cal utilitzar **self.\_origin**.
Observem aquest codi:

``` python
    @api.onchange('destiny')
    def _onchange_destiny(self):
        if len(self.destiny)>0:
            road_available = self.origin.roads & self.destiny.roads
            self._origin.write({'road': road_available.id})
            self.road = road_available.id
            
            return {}
```

El primer write escriu sobre el registre real del wizard i el segon
sobre el virtual per a veure el canvi.

## Alertes

És possible notificar a l\'usuari de varies maneres. En cas de que
s\'equivoque en un field, podem afegir un label amb vista condicional:

``` xml
 <field name="oil_required" />
 <field name="not_oil" invisible="1" />
 <label colspan="2"
    for="oil_available"
    string="Not sufficient Oil"
    attrs="{'invisible': [('not_oil','=', False)]}"
    style="background-color:yellow;"/>
 <field name="oil_available" />
```

També es pot mostrar un error en una finestra emergent. La manera més
senzilla és:

``` python
from odoo.exceptions import UserError
....
     raise UserError('Not Sufficient Oil for the travel')
```

En cas de necessitar una finestra més completa es pot fer un model, una
vista form i cridar a un action que la mostre.

Si volem notificar sense molestar massa, es pot cridar a una
**action.client** específica que mostra una notificació:

``` python
   return {
        'type': 'ir.actions.client',
        'tag': 'display_notification',
        'params': {
        'message': 'Not sufficient Oil, vehicle or driver',
        'type': 'danger',  #types: success,warning,danger,info
        'sticky': False,
    }
```

Pot ser de molts tipus i no tanca el wizard, per tant, es pot continuar.

## Exemple Complet de Wizards

El codi complet de l\'exemple està a:
[1](https://github.com/xxjcaxx/sge18-19/tree/master/wizards)

**Wizard cridat en un botó del formulari:**

Els wizards, generalment, necessiten una vista i un action que la cride:

``` xml
      <record model="ir.ui.view" id="wizards.w_reserves">
            <field name="name">wizard reserves</field>
            <field name="model">wizards.w_reserves</field>
            <field name="arch" type="xml">
            <form>
                 <header>
                        <field name="state" widget="statusbar"/>
                    </header>
                    <group>
                <h4>   <field name="teatre"/></h4>
            </group>
            <group states="obra">
                <field name="obra"/>
            </group>
            <group states = "actuacio">
                <field name="actuacio"/>
            </group>
            <group states="butaca,fin">
                        <field name="butaca"/>
 
                    </group>
                    <footer>
                <button states="fin" name="reserva" type="object"
                        string="Reserva" class="oe_highlight"/>
                        or
                        <button special="cancel" string="Cancel"/>
                    </footer>
 
                </form>
            </field>
        </record>
 
        <act_window id="wizards.w_reserves_action"
                    name="Crear reserves"
                    src_model="wizards.teatres"
                    res_model="wizards.w_reserves"
                    view_mode="form"
                    target="new"
                    />
```

Observem, en especial, el header amb el camp **state** i els groups amd
**states** per ser mostrats condicionalment. Això permetrà crear un
assistent.

Per a que funcione la vista, és necessari el model i el codi del
controlador del wizard:

``` python
class w_reserves(models.TransientModel):   # La classe és transientModel
     _name = 'wizards.w_reserves'
 
     def _default_teatre(self):                    
         return self.env['wizards.teatres'].browse(self._context.get('active_id')) 
         # El context conté, entre altre coses, el active_id del model que està obert.
 
     teatre = fields.Many2one('wizards.teatres',default=_default_teatre)
     obra = fields.Many2one('wizards.obres')
     actuacio = fields.Many2one('wizards.actuacions',required=True)
     butaca = fields.Many2one('wizards.butaques',required=True)
     state = fields.Selection([     # El camp state és per a crear l'assistent.
        ('teatre', "Teatre Selection"),
        ('obra', "Obra Selection"),                                             
        ('actuacio', "Actuacio Selection"),
        ('butaca', "butaca Selection"),
        ('fin', "Fin"),
        ], default='teatre')
 
 
     @api.onchange('teatre')   
     # Tots aquests onchange serveixen per ajudar a 
     # seleccionar les coses a l'usuari amb filtres
     def _oc_teatre(self):
        if len(self.teatre) > 0:
         actuacions = self.env['wizards.actuacions'].search([('teatre','=',self.teatre.id)])
         print(actuacions)
         obres = actuacions.mapped('obra')
         print(obres)
         self.state='obra'    
         # Canviem el state per a donar continuitat a l'assistent.
         return { 'domain': {'obra': [('id', 'in', obres.ids)]},}    
         # Modifiquem el filtre del següent field.

     @api.onchange('obra')
     def _oc_obra(self):
        if len(self.obra) > 0:
          actuacions = self.env['wizards.actuacions'].search([('teatre','=',self.teatre.id),('obra','=',self.obra.id)])

          self.state='actuacio'
          return { 'domain': {'actuacio': [('id', 'in', actuacions.ids)]},}


     @api.onchange('actuacio')
     def _oc_actuacio(self):
        if len(self.actuacio) > 0:
          print('butaques ******************************************')
          butaques = self.env['wizards.butaques'].search([('teatre','=',self.actuacio.teatre.id)])
          b_reservades = self.actuacio.reserves.mapped('butaca')
          print(b_reservades)
          b_disponibles = butaques - b_reservades    
          # Despres d'obtindre totes les butaques li llevem les reservades.
          print(b_disponibles)

          self.state='butaca'
          return { 'domain': {'butaca': [('id', 'in', b_disponibles.ids)]},}

     @api.onchange('butaca')
     def _oc_butaca(self):
        if len(self.butaca) > 0:
            self.state='fin'

     @api.multi
     def reserva(self):
         reserva = self.env['wizards.reserves'].create({
              'actuacio':self.actuacio.id,
               'butaca':self.butaca.id,
               'name':str(self.actuacio.name)+" - "+str(self.butaca.name)
               })
         return {     
         # Aquest return crea un action que, al ser cridat pel client,
         # obri el formulari amb la reserva creada.
    'name': 'Reserves',
    'view_type': 'form',
    'view_mode': 'form',
    'res_model': 'wizards.reserves',
    'res_id': reserva.id,
    'context': self._context,
    'type': 'ir.actions.act_window',
    'target': 'current',
                 }
```

Ara, al formulari del teatre, li afegim un botó per obrir el wizard:

``` xml
    <button name="%(wizards.w_reserves_action)d" string="Crear Reserva" type="action"/>
```

**Wizard cridat des del menú *dropdown* de action (el desplegable de
dalt)**:

En aquest cas, hem de crear un action window però amb un
**binding_model_id**:

``` xml
 <record id="wizards.w_reserves_pagar_action" model="ir.actions.act_window">
  <field name="name">Pagar varies reserves</field>
  <field name="type">ir.actions.act_window</field>
  <field name="res_model">wizards.w_pagar_reserves</field>
  <field name="view_type">form</field>
  <field name="view_mode">form</field>
  <field name="target">new</field>
  <field name="binding_model_id" ref="wizards.model_wizards_reserves"  />
</record>
```

El codi python és molt simple, en aquest cas, sols canvia que atén a la
variable de context **active_ids** en compte de **active_id**:

``` python
class w_pagar_reserves(models.TransientModel):
    _name = 'wizards.w_pagar_reserves'
 
    def _default_reserves(self):
         return self.env['wizards.reserves'].browse(self._context.get('active_ids')) # El context conté, entre altre coses, els active_ids dels models que es seleccionen en un tree.
 
    reserves = fields.Many2many('wizards.reserves',default=_default_reserves)

    def pagar(self):
        for r in self.reserves:
            r.write({'pagada':True})
```

El formulari del wizard també és molt senzill:

``` xml
        <record model="ir.ui.view" id="wizards.w_pagar_reserves">
            <field name="name">wizard pagar reserves</field>
            <field name="model">wizards.w_pagar_reserves</field>
            <field name="arch" type="xml">
            <form>
            <group >
                <field name="reserves"/>
            </group>
                    <footer>
                <button name="pagar" type="object"
                    string="Pagar" class="oe_highlight"/>
                        or
                        <button special="cancel" string="Cancel"/>
                    </footer>
 
                </form>
            </field>
        </record>
```
