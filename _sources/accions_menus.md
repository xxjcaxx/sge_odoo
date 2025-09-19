## Accions i menús

Diagrama de cóm es comporta el client web quan carrega Odoo per primera vegada i cóm crida a un action i carrega les vistes i les dades (records)

<!-- 
sequenceDiagram
    participant N as Navegador Web
    participant O as Servidor Odoo

    N->>O: GET / (port 8069)
    O->>N: index.html (bàsic)
    N->>O: GET JS i CSS QWeb 
    Note right of O: Crear els assets
    O->>N: Assets (JS i CSS) Templates

    Note left of N: Inicia Client Web

    N->>O: POST Load Views
    Note right of O: ir.ui.view
    O->>N: arch + json amb fields
    Note left of N: Polsem un menú

    N->>O: POST Load Action
    Note right of O: ir.ui.action
    O->>N: Definició de l'action

    N->>O: POST Load Views (per l'action)
    O->>N: Totes les vistes i fields

    N->>O: POST Search Read
    Note right of O: Select i compute
    O->>N: Json amb els records

    Note left of N: Analitza fields necessaris
    Note left of N: Renderitza la vista amb els records
-->

<div style="width: 600px;">
  <img src="./imgs/diamgramaactions.png" alt="Diagrama de flujo" style="width: 100%;" />
</div>


El client web de Odoo conté uns menús dalt i a l\'esquerra. Aquests
menús, al ser accionats mostren altres menús i les pantalles del
programa. Quant pulsem en un menú, canvia la pantalla perquè hem fet una
[acció](https://www.odoo.com/documentation/12.0/reference/actions.html).

Una acció bàsicament té:

- **type**: El tipus d\'acció que és i cóm l\'acció és interpretada.
    Quan la definim en el XML, el type no cal especificar-lo, ja que ho
    indica el model en que es guarda.
- **name**: El nom, que pot ser mostrat en la pantalla o no. Es
    recomana que siga llegible per els humans.

Les accions i els menús es declaren en fitxers de dades en XML o
directament si una funció retorna un diccionari que la defineix. Les
accions poden ser cridades de tres maneres:

- Fent clic en un menú.
- Fent clic en botons de les vistes (han d\'estar connectats amb
    accions).
- Com accions contextuals en els objectes.

D\'aquesta manera, el client web pot saber quina acció ha d\'executar si
rep alguna d\'aquestes coses:

- **false**: Indica que s\'ha de tancar el diàleg actual.
- **Una string**: Amb l\'etiqueta de **l\'acció de client** a
    executar.
- **Un número**: Amb el ID o external ID de l\'acció a trobar a la
    base de dades.
- **Un diccionari**: Amb la definició de l\'acció, aquesta no està ni
    en XML ni en la base de dades. En general, és la manera de cridar a
    un action al finalitzar una funció.

### Accions tipus *window*

Les accions *window* són un record més (**ir.actions.act_window**). No
obstant, els menús que les criden, tenen una manera més ràpida de ser
declarats amb una etiqueta **menuitem**:

``` xml
<record model="ir.actions.act_window" id="action_list_ideas">
    <field name="name">Ideas</field>
    <field name="res_model">idea.idea</field>
    <field name="view_mode">tree,form</field>
</record>
<menuitem id="menu_ideas" parent="menu_root" name="Ideas" sequence="10"
          action="action_list_ideas"/>
```

```{tip}
Les accions han de ser declarades al XML abans que els menús que les accionen. 
```

```{tip}
El que hem vist en esta secció és la definició d'una acció en un XML com a part de la vista, però una acció no és més que una forma còmoda d'escriure moltes coses que farà el client en javascript per demanar alguna cosa al servidor. Els actions separen i simplifiquen el desenvolupament de la interfície d'usuari que és el client web. Un menú o botó en html acciona una funció javascript que en principi no sap el que fer. Aquesta demana que es carregue la definició del seu action. Una vegada carregada la definició, queda clar tot el que ha de demanar (les vistes, context, dominis, vistes search, lloc on carregar-ho tot...) aleshores demana les vistes i amb ajuda de les vistes i els fields, demana els records que són les dades a mostrar. Per tant, un action és la definició sense programar javascript de coses que ha de fer el javascript. Odoo permet declarar actions com a resposta de funcions. Aquestes actions no estan en la base de dades, però són enviades igualment al client i el client fa en elles el mateix que en un action que ell ha demanat. Un exemple d'això són els actions que retornen els botons dels wizards. De fet, podem fer que un botó torne un action i, per tant, obrir una vista diferent. 
```

Aquest exemple és una funció cridada per un botó que retorna un action:

``` python
    @api.multi    # Molt important que siga multi.
    def create_comments(self):
       clients=self.env['reserves.bookings'].search([('checking_day','<',fields.Date.today()),('room.hotel','=',self.id)]).mapped('client').ids
       print(clients)
       if len(clients)>0:
        print(clients)
        random.shuffle(clients)
        comment = self.env['reserves.comments'].create({'hotel':self.id,'client':clients[0],'stars':str(random.randint(1,5))})
        return {
    'name': 'Comment',
    'view_type': 'form',
    'view_mode': 'form',
    'res_model': 'reserves.comments',
    'res_id': comment.id,
    #'view_id': self.env.ref('reserves.comments_form').id,
    'type': 'ir.actions.act_window',
    'target': 'current',
         }
```

Observem que li pasem el model i el res_id per a que puga obrir un
formulari amb el comentari creat.

Aquest és el json que rep el client després de cridar al botó:

``` javascript
{
   "jsonrpc":"2.0",
   "id":878622456,
   "result":{
      "name":"Comment",
      "view_mode":"form",
      "res_model":"reserves.comments",
      "res_id":20,
      "type":"ir.actions.act_window",
      "target":"current",
      "flags":{ },
      "views":[[false,"form"]]
   }
}
```

Ara el client pot demanar un formulari i el record corresponent al model
*reserves.comments* i el id *20*.

Anem a veure en detall tots els fields que tenen aquestes accions:

- **res_model**: El model del que mostrarà les vistes.
- **views**: Una llista de parelles en el ID de la vista i el tipus.
    En cas de que no sabem el ID de la vista, podem ficar **false** i
    triarà o crearà una per defecte. Observem l\'exemple anterior, on en
    la declaració de l\'acció no s\'especifica aquest field, però el
    client si acaba rebent-lo amb
    **\"views\":**. La llista
    de vistes la trau automàticament amb la funció
    **[fields_view_get()](https://www.odoo.com/documentation/12.0/reference/orm.html#odoo.models.Model.fields_view_get)**.
- **res_id**: (Opcional) Si es va a mostrar un form, indica la ID del
    record que es va a mostrar.
- **search_view_id**: (Opcional) Se li pasa (id, name) on id
    respresenta el ID de la vista search que es mostrarà.
- **target**: (Opcional) El destí del action. Per defecte és en la
    finestra actual (**current**), encara que pot ser a tota la pantalla
    (**full_screen**) o en un diàleg o *pop-up* (**new**) o **main** en
    cas de voler que es veja en la finestra actual sense les
    *breadcrumbs*, el que vol dir que elimina el rastre d\'on vé
    l\'acció.
- **context**: (Opcional)Informació addicional.
- **domain**: (Opcional) Aplica un filtre als registres que es demanaran a la base de dades.
- **limit**: (Opcional) Per defecte 80, és la quantitat de records que
    mostrar en la vista tree.
- **auto-search**: (Opcional) En cas de que necessitem una búsqueda
    només carregar la vista.

Exemples d\'Actions declarades en python:

``` python
# Action per obrir arbre i form:
{
    "type": "ir.actions.act_window",
    "res_model": "res.partner",
    "views": [[False, "tree"], [False, "form"]],
    "domain": [["customer", "=", true]],
}
# Action sols per a form en un id específic.
{
    "type": "ir.actions.act_window",
    "res_model": "product.product",
    "views": [[False, "form"]],
    "res_id": a_product_id,
    "target": "new",
}
# Action que ja està en la base de dades:
       action = self.env.ref('terraform.new_building_type_action_window').read()[0]
       return action
```

Quan guardem una action en la base de dades, normalment definint-la com
un XML, tenim aquest altres fields:

- **view_mode**: Lista separada per comes de les vistes que ha de
    mostrar. Una vegada el servidor va a enviar aquest action al client,
    amb açò generarà el field **views**.
- **view_ids**: Una llista d\'objectes de vista que permet definir la
    vista de la primera part de **views**. Aquesta llista és un
    Many2many amb les vistes i la taula intermitja es diu
    **ir.actions.act_window.view**.
- **view_id**: Una vista específica a afegir a **views**.

Per tant, si volem definir les vistes que volem que mostre el action,
podem omplir els camps anteriors. El servidor observa la llista de
**view_ids** i afegeix el **view_id**. Si no ompli tot el definit en
**view_mode**, acaba d\'omplir el field **views** (el que envía als
clients) amb (False,`<tipus>`). Exemple de cóm especificar una
vista en un action:

``` python
<field name="view_ids" eval="[(5, 0, 0),(0, 0, {'view_mode': 'tree', 'view_id': ref('tree_external_id')}),(0, 0, {'view_mode': 'form', 'view_id': ref('form_external_id')}),]" />
```

En els fitxers de dades, aquesta sintaxi és per a modificar fields Many2many. El **(5,0,0)** per
a desvincular les possibles vistes. El **(0,0,`<record>`{=html})** per
crear un nou record i vincular-ho. En aquest cas, crea un record amb els
dos fields necessaris, el tipus de vista i el External ID de la vista a
vincular.

Això també es pot fer més explícitament insertant records en **ir.actions.act_window.view**.

### Accions tipus URL 
Aquestes accions símplement obrin un URL. Exemple:

``` python
{
    "type": "ir.actions.act_url",
    "url": "http://odoo.com",
    "target": "self",     # Target pot ser self o new per reemplaçar el contingut de la pestanya del navegador o obrir una nova.
}
```

### Accions tipus Server

Les accions tipus server funcionen en un model base i poden ser
executades automàticament o amb el menú contextual d\'acció que es veu
dalt en la vista.

Les accions que pot fer un server action són:

- Executar un **codi python**. Amb un bloc de codi que serà executat
    al servidor.
- Crear un **nou record**.
- **Escriure** en un record existent.
- Executar **varies accions**. Per poder executar varies accions
    server.

Com es pot veure al codi de les server action:

``` python
 state = fields.Selection([
        ('code', 'Execute Python Code'),
        ('object_create', 'Create a new Record'),
        ('object_write', 'Update the Record'),
        ('multi', 'Execute several actions')], string='Action To Do',
        default='object_write', required=True,
        help="Type of server action. The following values are available:\n"
             "- 'Execute Python Code': a block of python code that will be executed\n"
             "- 'Create': create a new record with new values\n"
             "- 'Update a Record': update the values of a record\n"
             "- 'Execute several actions': define an action that triggers several other   

 server actions\n"
             "- 'Send Email': automatically send an email (Discuss)\n"
             "- 'Add Followers': add followers to a record (Discuss)\n"
             "- 'Create Next Activity': create an activity (Discuss)")
```

Permet executar codi en el servidor. És una acció molt genèrica que pot,
inclús retornar una acció tipus window. Les accions tipus server són una
forma més genèrica del que fa el button tipus **object**.

Veiem un exemple:

``` xml
<record model="ir.actions.server" id="print_instance">
    <field name="name">Res Partner Server Action</field>
    <field name="model_id" ref="model_res_partner"/>
    <field name="state">code</field>
    <field name="code">
        raise Warning(model._name)
    </field>
</record>
```

En l\'exemple anterior podem veure les característiques bàsiques:

- **ir.action.server**: El nom del model on es guardarà.
- **model_id**: És l\'equivalent a **res_model** en les accions tipus
    window. Es tracta del model sobre el que treballarà l\'action.
- **code**: Troç de codi que executarà. Pot ser un python complex o el
    nom d\'un mètode que ja tinga el model.

El servidor rebrà del client la ordre d\'executar eixe action. Eixa
ordre és un **Json** en el que sols es diu la **action_id** del action i
el context. Dins del context, tenim coses com els **active_id,
active_ids** o el **active_model**. El servidor executa sobre eixe model
el codi que diu l\'action. En l\'exemple anterior, simplement diu una
alerta.

El codi del action server pot definir una variable anomenada **action**
que retornarà al client la seguent acció a executar. Aquesta pot ser
window, això pot servir per refescar la pàgina o enviar a una altra.
Exemple:

``` xml
<record model="ir.actions.server" id="print_instance">
    <field name="name">Res Partner Server Action</field>
    <field name="model_id" ref="model_res_partner"/>
    <field name="state">code</field>
    <field name="code">
        if object.some_condition():
            action = {
                "type": "ir.actions.act_window",
                "view_mode": "form",
                "res_model": model._name,
                "res_id": object.id,
            }
    </field>
</record>
```

Però no sempre s\'utilitza l\'etiqueta **code**. Això depen d\'una altra
anomenada **state** que pot tindre el tipus d\'acció de servidor. Estan
disponibles els següents valors:

- **code** : Executar codi Python\': un bloc de codi Python que serà
    executat. En el cas d\'utilitzar code, el codi té accés a algunes
    variables específiques:
  - **env**: *Enviroment* d\'Odoo en el que l\'action s\'executa.
  - **model**: Model en que s\'executa. Es tracta d\'un
        **recordset** buit.
  - **record**: El registre en que s\'executa l\'acció.
  - **records**: Recordset de tots els registres en que s\'executa
        l\'acció (si es cridada per un tree, per exemple)
  - **time, datetime, dateutil, timezone** Bilioteques Python útils
        (**són python pures, no d\'odoo**)
  - **log(message, level=\'info\')**: Per enviar missatges al log.
  - **Warning** per llançar una excepció amb **raise**.
  - **action={\...}** per llançar una acció.
- **object_create**: Crear o duplicar un nou registre: crea un nou
    registre amb nous valors, o duplica un d\'existent a la base de
    dades
- **object_write**: Escriure en un registre: actualitza els valors
    d\'un registre
- **multi**: Executar diverses accions: defineix una acció que llança
    altres diverses accions de servidor
- **followers**: Afegir seguidors: afegeix seguidors a un registre
    (disponible a Discuss)
- **email**: Enviar un correu electrònic: envia automàticament un
    correu electrònic (disponible a email_template)

Exemple complet de action tipus server. (No fa res útil, però es pot
veure cóm s\'utilitza tot):

``` xml
    <record model="ir.actions.server" id="escoleta.creaar_dia_menjador">
    <field name="name">Creacio de un dia de menjador a partir d'una plantilla d'alumnes</field>
    <field name="model_id" ref="model_escoleta_menjador"/>
    <field name="state">code</field>
    <field name="code">
for r in records:
     fecha = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
     env['escoleta.menjador_day'].create({'name':fecha,'day':r.id})
     log('creat dia menjador',level='info')
     for s in r.students:
      log('creat alumne',level='info')
      env['escoleta.student_day'].create({'name':str(s.name)+" "+str(fecha),'student':s.id,'menjador_day':r.id})
action = {
                "type": "ir.actions.act_window",
                "view_mode": "tree",
                "res_model": "escoleta.menjador_day",
         }

    </field>
    <field name="binding_model_id" ref="escoleta.model_escoleta_menjador"/>
</record>
```

L\'exemple anterior mostra cóm podem crear un action server i executar
coses complexes en el servidor sense modificar el codi python del model.
Però açò té varis inconvenients: El primer és que estem desplaçant la
tasca del controlador a la vista o a una part en mig entre la vista i el
controlador. El segon inconvenient és que és més complicat escriure codi
python dins d\'un XML sense equivocar-se en la indentació. I el
inconvenient més important és que no tenim accés a totes les funcions
del ORM i biblioteques útils d\'Odoo del controlador. Per tant, és
recomanable crear una funció en el model i cridar-la:

``` xml
    <record model="ir.actions.server" id="escoleta.creaar_dia_menjador">
    <field name="name">Creacio de un dia de menjador a partir d'una plantilla d'alumnes</field>
    <field name="model_id" ref="model_escoleta_menjador"/>
    <field name="state">code</field>
    <field name="code">
action=model.crear_dia_menjador()      # Assignar el resultat de la funció a action per refrescar la web
    </field>
    <field name="binding_model_id" ref="escoleta.model_escoleta_menjador"/>
</record>
```

Codi de la funció:

``` python
    def crear_dia_menjador(self):                            
        # En el XML era records i en el python cal extraurer els records de active_ids                             
        records = self.browse(self._context.get('active_ids'))                            
        for r in records:
         # Ja es pot treballar millor en dates gràcies a la biblioteca 'fields'
         fecha = fields.Datetime.now()                                                               
         self.env['escoleta.menjador_day'].create({'name':fecha,'day':r.id})              
         for s in r.students:
           self.env['escoleta.student_day'].create({'name':str(s.name)+" "+str(fecha),'student':s.id,'menjador_day':r.id})
        return {                                                  
                # En el XML era action i ací fa falta que retorne el diccionari per assignar-lo a action
                "type": "ir.actions.act_window",                                          
                "view_mode": "tree",                                                      
                "res_model": "escoleta.menjador_day",                                     
         }      
```

### *Domains* en les *actions*

En Odoo, el concepte de **domain** o domini està en varis llocs, encara
que el seu funcionament sempre és el mateix. Es tracta d\'un criteri de
búsqueda o filtre sobre un model. La sintaxi dels domains és como veurem
en aquest exemple:

``` python
# [(nom_del_field, operador , valor)] 
['|',('gender','=','male'),('gender','=','female')]
```

Com es veu, cada condició va entre parèntesis amb el mon del field i el
valor desitjat entre cometes si és un *string* i amb l\'operador entre
cometes i tot separat per comes. Les dues condicions tenen un **\|**
dabant, que significa la **O** lògica. Està dabant per utilitzar la
[notació polaca
inversa](https://es.wikipedia.org/wiki/Notaci%C3%B3n_polaca_inversa).

Un action en domain treu vistes per als elements del model que
coincideixen en les condicions del domini. El domain és trauit per el
model en un *where* més a la consulta SQL. Per tant, al client no li
arriben mai els registres que no pasen el filtre. Els *domains* en les vistes search el funcionament en la
part del model és igual, ja que no ejecuta un action, però fa la mateixa
petició javascript.

Exemple de domain en action:

``` xml
    <record id="action_employee" model="ir.actions.act_window">
        <field name="name">Employee Male or Female</field>
        <field name="res_model">employee.employee</field>
        <field name="view_type">form</field>
        <field name="view_mode">tree,form</field>
                <field name="domain">['|',('gender','=','male'),('gender','=','female')]</field>
    </record>
```

### Actions per a molts records

Quan estem observant un tree, podem veure dalt uns menús desplegables
que mostren varies accions que es poden fer als records seleccionats del
tree. Com ara eliminar o duplicar. Nosaltres podem crear noves accions
que estaran ahí dalt.

Fins ara hem vist accions que s\'executen al polsar un menú o un botó.
El menú està declarat explícitament i el botó també. Les accions sols
són una manera de dir-li al client web cóm ha de demanar les coses i cóm
ha de mostrar-les. El client web de Odoo genera moltes part de
l\'interfície de manera automàtica. En el cas que ens ocupa, el client
web atén a un action demanat pel menú lateral, aquest mostra un tree en
la finestra corresponent. Però en la definició del tree, sols està la
part de les dades. Dalt del tree, el client web mostra una barra de
búsqueda i uns menús desplegables **dropdown**. Aquest menú és generat
pel client amb la llista d\'accions vinculades al model que està
mostrant.

La manera més senzilla de vincular un action al menú de dalt és amb aquests
fields que ara tenen les actions:

- **binding_type**: Per defecte és de tipus **action**, però pot ser
    **action_form_only** per mostrar un formulari o **report** per
    generar un report.
- **binding_model_id**: Aquest field serveix per vincular l\'action al
    menú de dalt de les vistes d\'eixe model.

Exemple tret del codi d\'Odoo 11:

``` xml
 <record id="action_view_sale_advance_payment_inv" model="ir.actions.act_window">
  <field name="name">Invoice Order</field>
  <field name="type">ir.actions.act_window</field>
  <field name="res_model">sale.advance.payment.inv</field>
  <field name="view_type">form</field>
  <field name="view_mode">form</field>
  <field name="target">new</field>
  <field name="groups_id" eval="[(4,ref('sales_team.group_sale_salesman'))]"/>
  <field name="binding_model_id" ref="sale.model_sale_order" />
</record>
```

Exemple per a accions tipus server:

``` xml
<record id="action_server_learn_skill" model="ir.actions.server">
    <field name="name">Learning</field>
    <field name="type">ir.actions.server</field>
    <field name="model_id" ref="your_module_folder_name.model_your_model" />
    <field name="binding_model_id" ref="module_folder_name.model_your_target_model" />
    <field name="state">code</field>
    <field name="code">model.action_learn()</field>
</record>
```

Per saber més de les actions, podem estudiar el codi:
[1](https://github.com/odoo/odoo/blob/18.0/odoo/addons/base/models/ir_actions.py)
