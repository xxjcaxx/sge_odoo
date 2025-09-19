# La vista

En aquest capítol, explorarem com funcionen les vistes en Odoo, quins tipus de vistes podem utilitzar i com es poden personalitzar mitjançant XML i accions de servidor. Aprendrem a estructurar correctament una interfície d'usuari, a definir formularis, llistats, kanbans i gràfics, i a gestionar la navegació entre ells.

Les vistes són la manera en la que es representen els models. En cas de que no declarem les vistes, es poden referenciar per el seu tipus i Odoo generarà una vista de llista o formulari estandar per poder vorer els registres de cada model. No obstant, quasi sempre volem personalitzar les vistes i en aquest cas, es poden referenciar per un identificador.

Les vistes tenen una prioritat i, si no s\'especifica el identificador de la que volem mostrar, es mostrarà la que més prioritat tinga.

``` xml
<record model="ir.ui.view" id="view_id">
    <field name="name">view.name</field>
    <field name="model">object_name</field>
    <field name="priority" eval="16"/>
    <field name="arch" type="xml">
        <!-- view content: <form>, <list>, <graph>, ... -->
    </field>
</record>
```

```{tip}
Les vistes es guarden en el model `ir.ui.view`. Tots els elements de interficie tenen en el seu nom ir.ui (Information Repository, User Interface). Els menús a ir.ui.menu o les accions a `ir.actions.window`
```
Exemple de vista form:

``` xml
  <record model="ir.ui.view" id="course_form_view">
            <field name="name">course.form</field>
            <field name="model">openacademy.course</field>
            <field name="arch" type="xml">
                <form string="Course Form">
                    <sheet>
                        <group>
                            <field name="name"/>
                            <field name="description"/>
                        </group>
                    </sheet>
                </form>
            </field>
        </record>
```

Encara que Odoo ja proporciona un list i un form per defecte, la vista
cal millorar-la quasi sempre. Totes les vistes tenen fields que poden
tindre widgets diferents. En les vistes form, podem adaptar molt
l\'aspecte amb grups de fields, pestanyes, camps ocults
condicionalment\...

## Les vistes list

> A partir d'Odoo 18 ja no hi ha vistes `tree` i són totes `list`, els exemples antics funcionaran canviant aquesta paraula. 

Les vistes *list* (o vistes de llista) són un dels tipus de vistes més utilitzats en Odoo. Permeten mostrar registres en format de taula, facilitant la visualització i la gestió de grans quantitats de dades.  

Aquestes vistes són especialment útils per a representar informació resumida d'un conjunt de registres, amb columnes que mostren els camps més rellevants. A més, poden incloure funcionalitats com l’ordenació, els filtres i les accions ràpides.  

Un exemple bàsic d’una vista *list* per al model de clients (*res.partner*) seria el següent:  

```xml
<record id="view_partner_list" model="ir.ui.view">
    <field name="name">res.partner.list</field>
    <field name="model">res.partner</field>
    <field name="arch" type="xml">
        <list>
            <field name="name"/>
            <field name="phone"/>
            <field name="email"/>
            <field name="company_id"/>
        </list>
    </field>
</record>
```

---

- `<record>`: Defineix un nou registre en el model `ir.ui.view`, que representa la vista.  
- `<field name="name">`: Assigna un nom únic a la vista.  
- `<field name="model">`: Indica el model al qual pertany la vista (`res.partner` en aquest cas).  
- `<field name="arch" type="xml">`: Conté l'estructura XML de la vista.  
- `<list>`: Defineix una vista de tipus *list*.  
- `<field name="name"/>`, `<field name="phone"/>`, etc.: Representen les columnes que es mostraran en la llista.  

### Colors

En les vistes list es pot modificar el **color** en funció del contingut
d\'un field amb l\'etiqueta **decoration**, que utilitza colors
contextuals de **Bootstrap**:

`   decoration-bf - Lineas en BOLD `\
`   decoration-it - Lineas en ITALICS `\
`   decoration-danger - Color LIGHT RED `\
`   decoration-info - Color LIGHT BLUE `\
`   decoration-muted - Color LIGHT GRAY `\
`   decoration-primary - Color LIGHT PURPLE `\
`   decoration-success - Color LIGHT GREEN `\
`   decoration-warning - Color LIGHT BROWN`

``` xml
<list  decoration-info="state=='draft'" decoration-danger="state=='trashed'">
    <field name="name"/>
    <field name="state"/>
</list>
```

En el cas de que es vulga comparar un field Date o Datetime es pot fer
amb la variable global de QWeb **current_date**. Per exemple:

``` xml
<list  decoration-info="start_date==current_date">
...
```

També es pot fer **decoration** en els fields individualment.

### Editable

També es pot fer **editable** per no tindre que obrir un form:
**editable=\"\[top \| bottom\]\"**. Top o Bottom indica on es crearan
els nous registres. Els lists editables poden tindre un atribut més
**on_write** que indica un mètode a executar quan s\'edita o crea un
element.

### Camps invisibles 

De vegades, un camp pot servir per a alguna cosa, però no cal que
l\'usuari el veja. El que cal fer és ficar el field , però dir que es
**invisible=\"1\"**

``` xml
<list  decoration-info="duration==0">
                    <field name="name"/>
                    <field name="course_id"/>
                    <field name="duration" invisible="1"/>
                    <field name="taken_seats" widget="progressbar"/>
                </list>
```

### Botons

Els *lists* poden tindre **buttons** amb els mateixos atributs que els
buttons dels forms.

```{tip}
Cal tindre cura en els lists dins de forms (X2many), ja que el botó s'executa en el model del list i no del formulari que el conté. Si volem accedir al pare, cal utilitzar l'atribut parent.
```

### Totals

En els lists es pot calcular totals amb aquesta etiqueta:

``` xml
<field name="amount" sum="Total Amount"/>
```

### Ordenar per un field 
Un list es pot ordenar per defecte per un field que no siga computat.
Això es fa en **default_order**. Mirem un exemple per ordenar
descendentment:

``` xml
<list default_order="sequence,name desc">
```

> Si volem que sempre s\'ordene per eixe criteri, sense importar la vista,
cal afegir al model l\'atribut **\_order**.

### Agrupar per un field

Amb **default_group_by**. Com l'atribut per ordenar, sols funciona amb camps guardats a la base de dades. 

```xml
<list default_group_by="born_year">
    <field name="name"/>
    <field name="born_year"/>
    <field name="age"/>
</list>
```

### banner_route

A partir de la versió 12 d\'Odoo, permet afegir als lists, forms, etc
una capçalera obtinguda per una url.
<https://www.odoo.com/documentation/12.0/reference/views.html#common-structure>

Aquesta capçalera serà un codi HTML que pot aprofitar les classes CSS
d\'Odoo, però no aprofita la generació de codi HTML que realitza el
client web d\'Odoo en la definició de les vistes. En cas d\'utilitzar
imatges, aquestes estaran en el directori **static** del mòdul.

**Fer un banner route pas a pas**:

El primer és ficar en el list la referència al **banner_route**:

``` xml
   <list banner_route="/negocity/city_banner" >
```

Ara cal crear el **web controller** que implementa aquesta ruta (es
recomana en controllers.py):

``` python
from odoo import http


class banner_city_controller(http.Controller):
    @http.route('/negocity/city_banner', auth='user', type='json')
    def banner(self):
        return {
            'html': """
                <div  class="negocity_banner" 
                style="height: 200px; background-size:100%; background-image: url(/negocity/static/src/img/negocity_city.jpg)">
                <div class="negocity_button" style="position: static; color:#fff;"><a>Generate Cities</a></div>
                </div> """
        }
```

En aquest cas, el CSS es podria fer un estil en CSS segons les
instruccions de [El client Web Odoo](El_client_Web_Odoo "wikilink").

El resultat és un banner amb un `<a>` que, de moment, no fa res.
Anem a donar-li funcionalitat a l\'enllaç. El primer és assignar-li un
action:

``` xml
                 <a class="banner_button" type="action" data-reload-on-close="true" 
                role="button" data-method="action_generate_cities" data-model="negocity.city">Generate Cities</a>
```

Segons les instruccions de
**addons/web/static/src/js/views/abstract_controller.js**, si fem un
`<a>` amb un **type=\"action\"**, el JS d\'Odoo interpretarà que
ha de cridar al backend a una funció d\'un model en concret. La resta de
dades es fan com l\'exemple. La funció que diu **data-method** és una
funció que ha d\'estar en el model que diu **data-model**.

## Les vistes form 

Per a que un form quede bé, es pot inclure la etiqueta
**`<sheet>`**, que fa que no ocupe tota la pantalla encara que
siga panoràmica.

Tot sheet ha de tindre **`<group>`** i dins els fields. Es poden
fer els group que vullgam i poden tindre string per mostrar un títol.

Si no utilitzem l\'etiquet group, els fields no tindran label, no
obstant, coses com el class=\"oe_edit_only\" no funcionen en el group,
per tant, cal utilitzar l\'etiqueta **`<label for="name">`**

Per facilitar la gestió, un form pot tindre pestanyes temàtiques. Es fa
en **`<notebook>` `<page string="titol">`**

Es pot separar els grups amb
**`<separator string="Description for Quotations"/>`**

Alguns **One2Many** donen una vista list que no es adequada, per això es
pot modificar el list per defecte:

``` xml
<field name="subscriptions" colspan="4">
   <list>...</list>
</field>
```

O especificar la vista que volem:
``xml
    <field name="subscriptions" context="{'list_view_ref': 'modul.view_subscriptions_tree'}"/>
```

En un One2many es pot especificar també el **form** que ens donarà quan
anem a crear un nou element.

Una altra opció és especificar la vista que insertarà en el field:

```xml
    <field name="m2o_id" context="{'form_view_ref': 'module_name.form_id'}"/>
```

> Les vistes tree embegudes tenen limitacions respecte a les cridades amb un action. Per exemple, no poden ser agrupades. 

**Valors per defecte en un one2many**

Quant creem un One2many en el mode form (o list editable) ens permet
crear elements d\'aquesta relació. Per a aconseguir que, al crear-los,
el camp many2one corresponga al pare des del que es crida, es pot fer
amb el context: Dins del field one2many que
estem fent fiquem aquest codi:

``` xml
context="{'default_<camp many2one>':active_id}"
```

O este exemple per a dins d\'un action:

``` xml
<field name="context">{"default_doctor": True}</field>
```

```{tip}
Aquesta sintaxi funciona per a passar per context valors per defecte a un form cridat amb un action. Pot ser en One2many, botons o menús
```
```{tip}
`active_id` és una variable que apunta al id del element que està en aquest moment actiu. Com que estem en un formulari, és el que se està creant o modificant amb en formulari. En el cas de la creació, active_id no està encara apuntant a un element de la base de dades, però funciona internament, encara que en el field no diga res o diga False.
```
```{tip}
En Odoo 14 ja no cal fer-ho, però el manual és vàlid per a altres many2ones o altres valors per defecte
```

**Domains en Many2ones**

Els camps Many2one es poden filtrar, per exemple:

``` xml
<field name="hotel" domain="[('ishotel', '=', True)]"/>
```

Funciona tant per a Many2one com per a Many2many.

### Widgets

Alguns camps, com ara les imatges, es poden mostrar utilitzant un
**widget** distint que el per defecte:

``` xml
<field name="image" widget="image" class="oe_left oe_avatar"/>
<field name="taken_seats" widget="progressbar"/>
<field name="country_id" widget="selection"/>
<field name="state" widget="statusbar"/>
```

Les vistes form, tree o kanban de Odoo mostren els fields en els
anomenats widgets. Aquests permeten, per exemple, que les dates tinguen
un calendari o que es mostre una llista en un many2many.

Cada field te un widget per defecte, però es poden canviar si volem
representar la informació de manera distinta. Aquests són els widgets
disponibles per a cada tipus de field, sobretot per al form, encara que
alguns funcionen en el tree:

#### Integer i Float

Els camps integer poden ser representats per molts widgets, es a dir, no
donen error. Encara que no tots tenen sentit, com per exemple el *text*.

-   **widget=\"integer\"**: Tan sols mostra el número sense comes. En
    cas de no tindre valor, mostra 0.
-   **widget=\"char\"**: També mostra el número, si no te valor deixa un
    buit i el camp és més ample.
-   **widget=\"id\"**: Mostra el número però no es pot editar.
-   **widget=\"float\"**: Mostra el número en decimals.
-   **widget=\"percentpie\"**: Mostra un gràfic circular amb el
    percentatge (no funciona en la vista tree ni en kanban).
-   **widget=\"float_time\"**: Mostra els float com si representaren el
    temps.
-   **widget=\"progressbar\"**: Mostra una barra de progrés (funciona en
    la vista tree i form, però no en kanban):
-   **widget=\"monetary\"**: Mostra el número amb 2 decimals.
-   **widget=\"gauge\"**: Mostra un curiós gràfic de semi-circul. Sols
    funciona en kanban.

    Observem un ús real del `Gauge` per veure com els widgets poden tenir opcions:
    
``` xml
<field name="current" widget="gauge" options="{'max_field': 'target_goal', 'label_field': 'definition_suffix', 'style': 'width:160px; height: 120px;'}" />
```

##### Char i Text {#char_i_text}

-   **widget=\"char\"**: Mostra un editor d\'un línia.
-   **widget=\"text\"**: Mostra un camp més alt per fer més d\'una
    línia.
-   **widget=\"email\"**: Crea el enllaç per enviar-li un correu.
-   **widget=\"url\"**: Crea el enllaç amb http.
-   **widget=\"date\"**: Permet guardar dates com cadenes de text.
-   **widget=\"html\"**: Permet guardar textos però amb format. Apareix
    un wysiwyg
-   **dashboard_graph**:

Mostra un gràfic menut indicant alguna progressió. Necessita tindre
guardat (o generat) en el char un json determinat, per exemple:

`[{"values":`\
`        [{"label":"2019-01-31","value": "7"},`\
`         {"label":"2019-02-01","value": "20"},`\
`         {"label":"2019-02-02","value": "45"},`\
`         {"label":"2019-02-03","value": "34"},`\
`         {"label":"2019-02-04","value": "40"},`\
`         {"label":"2019-02-05","value": "67"},`\
`         {"label":"2019-02-06","value": "80"}],`\
` "area":true, "title": "Next Week", "key": "Ocupation", "color": "#7c7bad"}]`

I aquest seria un exemple del XML per a que funcione:

``` xml
<field name="week_ocupation" widget="dashboard_graph"  graph_type="bar"/>
```

En els exemples que es poden veure en Odoo, aquests valors són sempre
computed, generant un json i invocant la funció de python json.dumps()
([2](https://docs.python.org/3.7/library/json.html)):

``` python
           values = []
           for i in record.sales:
               reserves = i.quantity
               values.append({'label':str(i.name),'value':str(reserves)})
           graph = [{'values': values, 'area': True, 'title': 'Sales', 'key': 'Sales', 'color': '#7c7bad'}]
           h.graph_data = json.dumps(graph)
```

Amés, accepta algunes opcions:

-   **type**: Pot ser **bar** o **line**. En el cas de ser line, en
    compte de \'label\' i \'value\' cal posar \'x\' i \'y\'.

#### Boolean

-   **Ribbon**: (Odoo 13) Mostra com una cinta al costat del formulari
    per mostrar un boolean important.

``` python
<widget name="web_ribbon" text="Archived" bg_color="bg-danger" />
<widget name="web_ribbon" text="Paid"/>
```

-   **boolean_toggle** per als trees, permet activar un boolean en un
    tree.

#### Date

-   **Daterange**: Mostra un rang de dates

``` python
date_begin = fields.Datetime( string='Start Date')
<field name="date_begin" widget="daterange"/>
```

#### Many2one

-   **widget=\"many2one\"**: Per defecte, crea un selection amb opció de
    crear nous. Accepta arguments per evitar les opcions de crear:

``` python
 <field name="field_name" options="{'no_create': True, 'no_open': True}"/>
```

-   **widget=\"many2onebutton\"**: Crea un simple botó que indica si
    està assignat. Si polses s\'obri el formulari.

![](Many2onebutton.png "Many2onebutton.png")

#### Many2Many

-   **widget=\"many2many\"**: Per defecte, crea una llista amb opció de
    esborrar o afegir nous.
-   **widget=\"many2many_tags\"**: Llista amb etiquetes com en els
    filtres

![](Many2many_tags.png "Many2many_tags.png")

-   **widget=\"many2many_checkboxes\"**: Llista de checkboxes.

![](Many2many_checkboxes.png "Many2many_checkboxes.png")

-   **widget=\"many2many_kanban\"**: Mostra un kanban dels que té
    associats, necessita que la vista kanban estiga definida.
-   **widget=\"x2many_counter\"**: Mostra sols la quantitat.
-   **many2many_tags_avatar**:

``` xml
partner_ids = fields.Many2many('res.partner', 'calendar_event_res_partner_rel', string='Attendees')
<field name="partner_ids" widget="many2many_tags_avatar" write_model="calendar.contacts" write_field="partner_id" avatar_field="image_128"/>
```

#### One2many

-   **widget=\"one2many\"**: Per defecte.
-   **widget=\"one2many_list\"**: Aparentment igual, es manté per
    retrocompatibilitat

#### Modificar el tree del One2many 

El one2many, al igual que el many2one es poden vorer en format tree. Per
defecte agafa el tree definit del model, però es pot especificar el tree
que volem veure:

``` xml
  <field name="fortress">
   <tree>
     <field name="name"/><field name="level"/>
   </tree>
  </field>
```

Inclús es pot forçar a mostrar un kanban:

``` xml
<field name="gallery" mode="kanban,tree" context="{'default_hotel_id':active_id}">
                 <kanban>
                 <!--list of field to be loaded -->
                 <field name="name" />
                 <field name="image" />

                 <templates>
                 <t t-name="kanban-box">
                     <div class="oe_product_vignette">
                     <a type="open">
                        <img class="oe_kanban_image" style="width:300px; height:auto;"
                        t-att-src="kanban_image('marsans.hotel.galley', 'image', record.id.value)" />
                    </a>
                    <div class="oe_product_desc">
                        <h4>
                        <a type="edit">
                            <field name="name"></field>
                        </a>
                        </h4>

                    </div>
                    </div>
                    </t>
                    </templates>
                </kanban>
                </field>
```

De vegades, el kanban este no funciona perquè no força a carregar les
imatges.

#### Binary o Image 

-   **signature**: Permet signar dirènctament en la pantalla

```{=html}
<!-- -->
```
-   **image**: A banda del que es pot ficar en el field de max_width o
    max_height, al widget es pot afegir opcions com:

```{=html}
<!-- -->
```
    options="{&quot;zoom&quot;: true, &quot;preview_image&quot;: &quot;image_128&quot;}

#### Selection

           <field name="state" decoration-success="state == 'sale' or state == 'done'" decoration-info="state == 'draft' or state == 'sent'" widget="badge" optional="show"/>

#### Fields dels trees 

-   **handle**: Per a ordenar a ma. Cal que aquest camp siga el criteri
    d\'ordenació.


**Reescalar les imatges**

Molt a sovint, tenim la necessitat de reescalar les imatges que
l\'usuari penja. A partir d\'Odoo 13 tenim el field Image que permet
tindre diferents resolucions amb varis related

#### buttons

Podem introduir un botó en el form:

``` xml
 <button name="update_progress" type="object" string="update" class="oe_highlight" /> <!-- El name ha de ser igual que la funció a la que crida. -->   
```

La funció pot ser una del model en el que està o un action. En el type
cal indicar el tipus amb: **object, action, url, client** En l\'exemple
anterior, el button és de tipus object. Aixó vol dir que crida a una
funció del model al que represente el formulari que el conté.

```{tip}
És important que el record sobre el que es pulsa un botó de tipus object estiga ja guardat, ja que si no existeix en la base de dades, el servidor no té la seua '''id''' i pot fer res. Per això, un botó polsat en fase de creació crida primer a la funció create().
```

Per a fer un butó que cride a un altre formulari, s\'ha de fer en un
tipus **action**. Amés, per ficar la id del **action** al que es vol
cridar, cal ficar el prefixe i sufixe **%(\...)d**, com en l\'exemple:

``` xml
 <button name="%(launch_mmog_fortress_wizard)d" type="action" string="Launch attack" class="oe_highlight" />
```

D\'aquesta manera, un formulari, té un botó que, al ser polsat, envia el
ID de **l\'action** a executar als servidor, aquest li retorna un action
per a que el client l\'execute. L\'action pot obrir una altra finestra o
un *pop-up*. En qualsevol cas, aquest action executat en el client,
demana la vista i les dades que vol mostrar i les mostra. Aquesta és la
raó de la sintaxis **%(\...)d**. 
Ja que es tracta d\'un **External Id** a una action guardada en la base de
dades.

Els *buttons* poden tindre una icona. Odoo proporciona algunes que es
poden trobar a aquesta web:
[1](https://es.slideshare.net/TaiebKristou/odoo-icon-smart-buttons)

``` xml
<button name="test" icon="fa-star-o" confirm="Are you sure?"/>
Esborrar: <button type="object" icon="fa-trash-o"  name="unlink"/>
```

En l\'exemple anterior, també hem ficat l\'atribut **confirm** per
mostrar una pregunta a l\'usuari. Els *buttons* es poden posar per el
form, encara que es recomana en el header:

``` xml
<header>
 <field name="state" widget="statusbar"/>
 <button name="accept" type="object" string="Accept" class="oe_highlight"/>
 <button special="cancel" string="Cancel"/>
</header>
```

Els botons sempre executen una funció de Javascript en la part del
client web que demana alguna cosa al servidor. En el cas dels button
**action**, demana el action, per després executar aquesta. En el cas
dels buttons **object** demana que s\'execute una funció del model i
recordset actual en el servidor. El client web es queda a l\'espera
d\'una resposta del servidor, que si és un diccionari buit, provoca un
refresc de la pàgina, però pot retornar moltes coses: **warnings**,
**domains**, **actions**\... i el client ha d\'actuar en conseqüència.
Els buttons poden tindre també [**context**](Odoo#Context "wikilink")
per enviar alguna cosa extra al servidor.

**Smart Buttons**
[2](https://www.slideshare.net/openobject/odoo-smart-buttons)

En el formulari dels client, podem veure aquests botons:

![](Smartbutton.png "Smartbutton.png")

Es tracta de botons que, amés d\'executar-se, mostren una informació
resumida i una icona. El text i la forma del botó es modifica
dinàmicament en funció d\'alguns criteris i això li dona més comoditat a
l\'usuari. Per exemple, si sols vol saber quantes factures té eixe
client, el botó li ho diu. Si polsa el botó ja va a les factures en
detall.

Per fer-los, el primer és modificar la seua forma, de botó
automàticament creat per el navegador a un rectangle. Això odoo ho pot
fer per CSS amb la classe **class=\"oe_stat_button\"**. A continuació,
se li posa una icona **icon=\"fa-star\"**.
[3](https://es.slideshare.net/TaiebKristou/odoo-icon-smart-buttons). A
partir d\'ahí, l\'etiqueta **`<button>`** pot contindre el
contingut que desitgem. Per exemple, camps *computed* que mostren el
resum del formulari que va a obrir.

``` xml
       <div class="oe_button_box">
             <button type="object" class="oe_stat_button" icon="fa-pencil-square-o" name="regenerate_password">
                        <div class="o_form_field o_stat_info">
                            <span class="o_stat_value">
                                <field name="password" string="Password"/>
                            </span>
                            <span class="o_stat_text">Password</span>
                        </div>
                    </button>
            </div>
```

#### Formularis dinàmics 

Els fields dels formularis permet modificar el seu comportament en
funció de condicions. Per exemple, ocultar amb **invisible**, permetre
ser editat o no amb **readonly** o **required**.

**Ocultar condicionalment un field**

Es pot ocultar un field si algunes condicions no es cumpleixen. Per
exemple:

``` xml
<field name="boyfriend_name" invisible = "married != False"/>
```

Tambés es pot ocultar i mostrar sols en el mode edició o lectura:

``` xml
<field name="partit" class="oe_edit_only"/>
<field name="equip" class="oe_read_only"/>
```

O mostrar si un camp anomenat **state** té un determinat valor:

``` xml
 <group invisible = "state in ['player', 'stats']" ><field name="dia"/></group>
```

En el següent exemple, introdueix dos conceptes nous: el
**column_invisible** per ocultar una columna d\'un list i el **parent**
per fer referència al valor d\'un field de la vista pare:

``` xml
<field name="lot_id" 
attrs="{'column_invisible': [('parent.state', 'not in', ['sale', 'done'])] }"
/>
```

**Editar condicionalment un field**

Es pot afegir **readonly**

``` xml
<field name="name2"
readonly = "condition == False"
/>
```

Aquests exemples combinen tots:

``` xml
<field name="name" 
invisible = "condition1 == False" 
required = "condition2 == True"
readonly = "condition3 == True"
 />

<field name="suma" 
readonly = "valor == 'calculat"
invisible = "servici in ['Reparacions','Manteniment'] or client == 'Pepe'"
/>
```

**readonly**

En ocasions volem que un field siga readonly, al no poder editar, no pot
ser required. En cas de ser modificar per un Onchage i es vulga guardar,
cal afegir:

``` xml
<field name="salary" readonly="1" force_save="1"/> 
```


### Vistes Kanban

Les vistes kanban són per a mostrar el model en forma de \'cartes\'. Les
vistes kanban se declaren amb una mescla de xml, html i plantilles
**Qweb**.

Un Kanban és una mescla entre list i form. En Odoo, les vistes tenen una
estructura jeràrquica. En el cas del Kanban, està la **vista Kanban**,
que conté molts **Kanban Box**, un per a cada *record* mostrat. Cada
kanban box té dins un *div* de *class* **vignette** o **card** i, dins,
els **Widgets** per a cada field.

                 Window
    +---------------------------+
    |     Kanban View           |
    | +----------+ +----------+ |
    | |Kanban Box| |Kanban Box| |
    | +----------+ +----------+ |
    | || Widget || || Widget || |
    | |----------| |----------| |
    | |----------| |----------| |
    | || Widget || || Widget || |
    | |----------| |----------| |
    | +----------+ +----------+ |
    |                           |
    +---------------------------+

Per mostrar un Kanban, la vista de Odoo, obri un action Window, dins
clava una caixa que ocupa tota la finestra i va recorreguent els records
que es tenen que mostrant i dibuixant els widgets de cada record.

```{tip}
A diferència en els lists o forms, els kanbans poden ser molt variats i han de deixar llibertat per ser dissenyats. És per això, que els desenvolupadors d'Odoo no han proporcionat unes etiquetes i atributs XML d'alt nivell com passa en els forms o lists, en els que no hem de preocupar-nos de la manera en que serà renderitzar, el CSS o cóm obté els fields de la base de dades. Al fer un Kanban, entrem al nivel de QWeb, per el que controlem plantilles, CSS i indicacions i funcions per al Javascript. Tot això està ocult en la resta de vistes, però en Kanban és impossible ocultar-ho.
Es poden utilitzar certs widgets en els fields com `image` o `progress_bar`, però són molts menys widgets que en els forms o lists.
```
Exemple bàsic:

``` xml
<record model="ir.ui.view" id="socio_kanban_view">
            <field name="name">cooperativa.socio</field>
            <field name="model">cooperativa.socio</field>
            <field name="arch" type="xml">
                <kanban>
                    <!--list of field to be loaded -->
                    <field name="name" />
                    <field name="id" /> <!-- És important afegir el id per al record.id.value -->
                    <field name="foto" />
                    <field name="arrobas"/>

                    <templates>
                    <t t-name="kanban-box">
                            <div class="oe_product_vignette">
                                <a type="open">
                                    <img class="oe_kanban_image"
                                        t-att-alt="record.name.value"
                                        t-att-src="kanban_image('cooperativa.socio', 'foto', record.id.value)" />
                                </a>
                                <div class="oe_product_desc">
                                    <h4>
                                        <a type="edit">
                                            <field name="name"></field>
                                        </a>
                                    </h4>
                                    <ul>

                                       <li>Arrobas: <field name="arrobas"></field></li>
                                    </ul>
                                </div>
                            </div>
                        </t>
                    </templates>
                </kanban>
            </field>
        </record>
```


En l\'anterior vista kanban cal comentar les línies.

Al principi es declaren els fields que han de ser mostrats. Si no es
necessiten per a la lògica del kanban i sols han de ser mostrats no cal
que estiguen declarats al principi. No obstant, per que l\'exemple
estiga complet els hem deixat. Aquesta declaració, fa demanar els fields
en la primera petició asíncrona de dades. Els no especificats ací, són
demanats després, però no estan disponibles per a que el Javascript puga
utilitzar-los.

A continuació ve un template **Qweb** en el que cal definir una etiqueta
**`<t t-name="kanban-box">`** que serà renderitzada una vegada
per cada element del model.

Dins del template, es declaren divs o el que necessitem per donar-li el
aspecte definitiu. Odoo ja té en el seu CSS unes classes per al
productes o partners que podem aprofitar. El primer **div** defineix la
forma i aspecte de cada caixa. Hi ha múltiples classes CSS que es poden
utilitzar. Les que tenen **vignette** en principi no mostren vores ni
colors de fons. Les que tenen **card** tenen el *border* prou marcat i
un color de fons. Les bàsiques són **oe_kanban_vignette** i
**oe_kanban_card**.

Hi ha molts altres CSS que podem estudiar i utilitzar. Per exemple, els
oe_kanban_image per a fer la imatge d\'una mida adequada o el
oe_product_desc que ajuda a colocar el text al costat de la foto. En
l\'exemple, usem uns **`<a>`** amb dos tipus: open i edit. Segons
el que posem, al fer click ens obri el form en mode vista o edició.
Aquests botons o enllaços poden tindre aquestes funcions:

-   **action**, **object**: Com en els botons dels forms, criden a
    accions o a mètodes.
-   **open**, **edit**, **delete**: Efectua aquestes accions al record
    que representa el kanban box.

Si ja volem fer un kanban més avançat, tenim aquestes opcions:

-   En la etiqueta **`<kanban>`**:
    -   **default_group_by** per agrupar segons algun criteri al agrupar
        apareixen opcions per crear nous elements sense necessitat
        d\'entrar al formulari.
    -   **default_order** per ordenar segons algun criteri si no s\'ha
        ordenat en el list.
    -   **quick_create** a true o false segons vulguem que es puga crear
        elements sobre la marxa sense el form. Per defecte és false si
        no està agrupat i true si està agrupat.
-   En cada **field**:
    -   **sum, avg, min, max, count** com a funcions d\'agregació en els
        kanbans agrupats.
-   Dins del **template**:
    -   Cada **field** pot tindre un **type** que pot ser open, edit,
        action, delete.
-   Una serie de funcions javascript:
    -   **kanban_image()** que accepta com a argument: model, field, id,
        cache i retorna una url a una imatge. La raó és perquè la imatge
        està en base64 i dins de la base de dades i cal convertir-la per
        mostrar-la.
    -   **kanban_text_ellipsis(string\[, size=160\])** per acurtar
        textos llargs, ja que el kanban sols és una previsualització.
    -   **kanban_getcolor(raw_value)** per a obtindre un color dels 0-9
        que odoo te predefinits en el CSS a partir de qualsevol field
        bàsic.
    -   **kanban_color(raw_value)** Si tenim un field **color** que pot
        definir de forma específica el color que necessitem. Aquest
        field tindrà un valor de 0-9.


**Forms dins de kanbans**:

A partir de la versió 12 es pot introduir un form dins d\'un kanban,
encara que es recomana que siga simple. Aquest funciona si tenim activat
el **quick_create** i preferiblement quan el kanban està agrupat per
Many2one o altres. Observem, per exemple el kanban de la secció de
tasques del mòdul de proyecte:

``` xml
<kanban default_group_by="stage_id" class="o_kanban_small_column o_kanban_project_tasks" on_create="quick_create"
 quick_create_view="project.quick_create_task_form" examples="project">
....
</kanban>
```

Com podem observar, té activat el **quick_create** i una referència al
identificador extern d\'una vista form en **quick_create_view**. Aquest
és el contingut del form:

``` xml
<?xml version="1.0"?>
<form>
  <group>
     <field name="name" string="Task Title"/>
     <field name="user_id" options="{'no_open': True,'no_create': True}"/>
  </group>
 </form>
```


#### Imatges en els Kanbans

En molts llocs trobarem la funció `kanban_image`. És la manera correcta de fer-ho en Qweb. Necessita posar el camp `id` el principi. però també es pot utilitzar dirèctament el `widget="image"` com en els forms. 


### Vistes search 

Les vistes search tenen 3 tipus:

-   **field** que permeten buscar en un determinat camp.
-   **filter** amb **domain** per filtrar per un valor predeterminat.
-   **filter** amb **group** per agrupar per algun criteri.

Pel que fa a les search **field**, sols cal indicar quins fields seran
buscats.

``` xml
<search>
    <field name="name"/>
    <field name="inventor_id"/>
</search>
```

```{tip}
Els fields han de ser guardats en la base de dades, encara que siguen de tipus '''computed'''
```
Les **field** poden tindre un **domain** per especificar quin tipus de
búsqueda volem. Per exemple:

``` xml
<field name="description" string="Name and description"
    filter_domain="['|', ('name', 'ilike', self), ('description', 'ilike', self)]"/>
```

Busca per 'name' i 'description' amb un domini que busca que es parega
en "case-insensitive" (ilike) el que escriu l'usuari (self) amb el name
o amb la descripció.

o:

``` xml
<field name="cajones" string="Boxes or @" filter_domain="['|',('cajones','=',self),('arrobas','=',self)]"/> 
```

Busca per *cajones o arrobas* sempre que l\'usuari pose el mateix
número.

Les **filter** amb **domain** són per a predefinir filtres o búsquedes.
Per exemple:

``` xml
<filter name="my_ideas" string="My Ideas" domain="[('inventor_id', '=', uid)]"/>
<filter name="more_100" string="More than 100 boxes" domain="[('cajones','>',100)]"/> 
<filter name="Today" string="Today" domain="[('date', '&gt;=', datetime.datetime.now().strftime('%Y-%m-%d 00:00:00')),
                                             ('date', '&lt;=',datetime.datetime.now().strftime('%Y-%m-%d 23:23:59'))]"/>
```

```{tip}
Els filtres sols poden comparar un field amb un valor específic. Així que si volem comparar dos fields cal fer una funció.
```
#### Operadors per als domains: 

\'like\': \[(\'input\', \'like\', \'open\')\] - Returns case sensitive
(wildcards - \'%open%\') search.

O/p: open, opensource, openerp, Odooopenerp

\'not like\': \[(\'input\', \'not like\', \'open\')\] - Returns results
not matched with case sensitive (wildcards - \'%open%\') search.

O/p: Openerp, Opensource, Open, Odoo, odoo, OdooOpenerp

\'=like\': \[(\'name\', \'=like\', \'open\')\] - Returns exact (=
\'open\') case sensitive search.

O/p: open

\'ilike\': \[(\'name\', \'ilike\', \'open\')\] - Returns exact case
insensitive (wildcards - \'%open%\') search.

O/p: Openerp, openerp, Opensource, opensource, Open, open, Odooopenerp,
OdooOpenerp

\'not ilike\': \[(\'name\', \'not ilike\', \'open\')\] - Returns results
not matched with exact case insensitive (wildcards - \'%open%\') search.

O/p: Odoo, odoo

\'=ilike\': \[(\'name\', \'=ilike\', \'open\')\] - Returns exact (=
\'open\' or \'Open\') case insensitive search.

O/p: Open, open

\'=?\':

name = \'odoo\' parent_id = False \[(\'name\', \'like\', name),
(\'parent_id\', \'=?\', parent_id)\] - Returns name domain result & True

name = \'odoo\' parent_id = \'openerp\' \[(\'name\', \'like\', name),
(\'parent_id\', \'=?\', parent_id)\] - Returns name domain result &
parent_id domain result

\'=?\' is a short-circuit that makes the term TRUE if right is None or
False, \'=?\' behaves like \'=\' in other cases

\'in\': \[(\'value1\', \'in\', \[\'value1\', \'value2\'\])\] - in
operator will check the value1 is present or not in list of right term

\'not in\': \[(\'value1\', \'not in\', \[\'value2\'\])\] - not in
operator will check the value1 is not present in list of right term
While these \'in\' and \'not in\' works with list/tuple of values, the
latter \'=\' and \'!=\' works with string

\'=\': value = 10 \[(\'value\',\'=\',value)\] - term left side has 10 in
db and term right our value 10 will match

\'!=\': value = 15 \[(\'value\',\'!=\',value)\] - term left side has 10
in db and term right our value 10 will not match

\'child_of\': parent_id = \'1\' #Agrolait \'child_of\':
\[(\'partner_id\', \'child_of\', parent_id)\] - return left and right
list of partner_id for given parent_id

\'\<=\', \'\<\', \'\>\', \'\>=\': These operators are largely used in
openerp for comparing dates - \[(\'date\', \'\>=\', date_begin),
(\'date\', \'\<=\', date_end)\]. You can use these operators to compare
int or float also.

Els **filter** amb **group** agrupen per algun field:

``` xml
<group string="Group By">
        <filter name="group_by_inventor" string="Inventor" context="{'group_by': 'inventor_id'}"/>
</group>
o:
```

``` xml
  <filter name="group_by_matricula" string="Matricula" context="{'group_by': 'matricula'}"/>
```

Si agrupem per data, el grup és per defecte per cada mes, si volem
agrupar per dia:

``` xml
<filter name="group_by_exit_day" string="Exit" context="{'group_by': 'exit_day:day'}"/>  
```

Si volem que un **filtre estiga predefinit** s\'ha de posar en el
context de **l\'action**:

``` xml
<field name="context">{'search_default_clients':1,"default_is_client": True}</field>
```

En aquest exemple, filtra amb en **search_default_XXXX** que activa el
filtre XXXX i, amés, fa que en els formularis tiguen un camp boolean a
true.

### Vistes Calendar

Si el recurs té un camp date o datetime. Permet editar els recursos
ordenats per temps. L'exemple són els esdeveniments del mòdul de ventes.

-   **string**, per al títol de la vista
-   **date_start**, que ha de contenir el nom d'un camp datetime o date
    del model.
-   **date_delay**, que ha de contenir la llargada en hores de
    l'interval.
-   **date_stop**, Aquest atribut és ignorat si existeix l'atribut
    date_delay.
-   **day_length**, per indicar la durada en hores d'un dia. OpenObject
    utilitza aquest valor per calcular la data final a partir del valor
    de date_delay. Per defecte, el seu valor és 8 hores.
-   **color**, per indicar el camp del model utilitzat per distingir,
    amb colors, els recursos mostrats a la vista.
-   **mode**, per mostrar l'enfoc (dia/setmana/mes) amb el què s'obre la
    vista. Valors possibles: day, week, month. Per defecte, month.

``` xml
 <record model="ir.ui.view" id="session_calendar_view">
            <field name="name">session.calendar</field>
            <field name="model">openacademy.session</field>
            <field name="arch" type="xml">
                <calendar string="Session Calendar" date_start="start_date"
                          date_stop="end_date"
                          color="instructor_id">
                    <field name="name"/>
                </calendar>
            </field>
        </record>
```

### Vistes Graph

En general s\'utilitza per a veure agregacions sobre les dades a
mostrar. Accepta els següents atributs:

-   **string**, per al títol de la vista
-   **type**, per al tipus de gràfic. (bar, pie, line)
-   **stacked** sols per a bar per mostrar les dades amuntonades en una
    única barra.

La definició dels elements fills de l'element arrel graph determina el
contingut del gràfic:

-   Primer camp: eix X (horitzontal). Obligatori.
-   Segon camp: eix Y (vertical). Obligatori.

A cadascun dels camps que determinen els eixos, se'ls pot aplicar els
atributs següents:

-   name: El nom del field
-   title: El nom que tindrà en el gràfic
-   invisible: No apareixerà
-   type: En aquest cas cal dir si és **row** per agrupar per aquest
    field, **col** per fer distintes línies o **measure** per a les
    dades en sí que es van a agregar.

``` xml
 <record model="ir.ui.view" id="terraform.planet_changes_graph">
      <field name="name">Planet Changes graph</field>
      <field name="model">terraform.planetary_changes</field>
      <field name="arch" type="xml">
        <graph string="Changes History" type="line">
          <field name="time"  type="row"/>
          <field name="planet"  type="col"/>
          <field name="greenhouse" type="measure"/>
        </graph>
      </field>
    </record>
```

```{tip}
Les vistes graph en Odoo són molt limitades, sols accepten un element en les X i necessiten que els camps estiguen guardats en la base de dades
```
