# Web Controllers

En Odoo hi ha moltes maneres de comunicar-se amb el
servidor:

-   Entrant en el backend
-   La pàgina web (frontend)
-   El TPV
-   Amb un API de XML-RPC per a aplicacions Java, Python o PHP.
-   Amb els controladors web per a consultes web o Ajax.

Si volem fer la web amb el CMS d\'Odoo, cal aprendre a fer webs en Odoo.
Però si el que volem és accedir a Odoo com un servidor **Rest** o
similar des de una aplicació web diferent, hem de crear la interficie de
servidor web amb Odoo i formular correctament les peticions Ajax.

En aquest manual la intenció és fer una aplicació web en Angular que
consulte coses a Odoo.

Odoo utilitza la biblioteca
<https://werkzeug.palletsprojects.com/en/1.0.x/> per als seus
controladors web, encara que simplifica la complexitat de la mateixa en
els seus propis mètodes. Quasi totes les aplicacions web fetes en Python
necessiten una manera estàndard de comunicar-se amb el servidor web.
Aquesta es diu **WSGI** i Odoo la implementa a partir de la biblioteca
Werzeug. Aquesta biblioteca implementa les particularitats d\'un
servidor web i les translada amb un llenguatge comú a l\'aplicació web
corresponent. No obstant, a l\'hora del desplegament, es sol instal·lar
un servidor web tipus Nginx per fer de proxy invers i implementar HTTPS
o una web estàtica, per exemple.
[1](https://serverfault.com/questions/220046/why-is-setting-nginx-as-a-reverse-proxy-a-good-idea)


Quan fem un mòdul en scaffold, es crea el fitxer
controllers/controllers.py, el qual està comentat, però que té un
exemple molt útil de controlador.

Si analitzem les primeres línies:

``` python
class MyController(http.Controller):
    @http.route('/school/course/', auth='user', type='json')
    def course(self):
...
```

Veurem que és una classe que hereta de **http.controller**. A
continuació hi ha un decorador que modifica la funció **course()** per a
ser executada quan es demana la ruta especificada. Aquest decorador diu
que necessita una **autentificació d\'usuari** i que espera i retorna un
**json**.

L\'autentificació pot ser **public**, **user** o **none**.

En aquestes funcions es sol cridar a **http.request.render** amb una
template per a fer html. Una altra opció és generar les dades
directament en Python.

Podem fer aquest exemple:

``` python
@http.route('/school/courses/json', type='json', auth='none')
def courses_json(self):
   records = request.env['school.course'].sudo().search([])
   return records.read(['name'])
```

El controlador espera un JSON i retorna un JSON. Si volem provar si
funciona sense complicacions, podem excriure en una terminal:

`curl -i -X POST -H "Content-Type: application/json" -d "{}" localhost:8069/school/courses/json`

Com es veu, sols hem enviat un JSON buit.

```{tip}
JSON també és HTTP, podem fer un route de tipus http que retorne un JSON, però Odoo facilita molt el tractament de les dades si fiquem directament json en el type.
```

Una altra cosa que cal mirar en l\'exemple és que no estic generant un
JSON, sols retornant un array de noms. Odoo, a través del decorador que
diu que és JSON ja el formatarà per a que retorne un JSON correcte. En
cas de voler controlar tot el que s\'envía, podem retornar el resultat
de **request.make_response()**

**Request** és un objecte estàtic que fa referència a la petició que
s\'està realizant. Té métodes i atributs útils com **request.env**, que
és similar al self.env dels models. Una altra utilitat és
**request.session** que guarda la sessió actual.

**sudo()** és necessari si fem que no es necessite autentificació. No
obstant, açò és per provar. En producció sempre necessitarem
autentificació.

## Passar paràmetres al web controller

Odoo permet passar paràmetres de la forma tradicional del GET o el POST
(amb ?) o com es fa en REST, com a part de la URL.

En el cas tradicional:

``` python
@http.route('/school/course_details', type='http', auth='none')
def course_details(self, course_id):
  record = request.env['school.course'].sudo().browse(int(course_id))
  return u'<html><body><h1>%s</h1>Teachers: %s' % ( record.name, u', '.join(record.teachers_ids.mapped('name')) or 'none',)
```

El que ens interessa és course_id, el qual trau de una url com aquesta:

`/school/course_details?course_id=2`

En el cas d\'una URL segons l\'estandard REST:

``` python
@http.route('/school/course_details/<model('school.course'):course>', type='http', auth='none')
def course_details(self, course):
  return u'<html><body><h1>%s</h1>Teachers: %s' % ( course.name, u', '.join(course.teachers_ids.mapped('name')) or 'none',)
```

En aquest cas veiem cóm obté la variable course de buscar en el model
school.course el id passat per paràmetres amb
**\<model(\'school.course\'):course\>** i ja el pot utilitzar per al que
necessite. La URL en aquest cas quedarà com:

`/school/course_details/2`

Aquest mètode utilitza un **converter** de la biblioteca *werkzeug*.

Si el que volem és enviar dades en JSON, sols cal indicar en el
decorador route que és de **type=\'json**\' i respectar un format en el
json com aquest:

``` json
 {"jsonrpc":"2.0","method":"call","params":{"user":"${user}","password":"${pass}"}}
```

## CORS en Odoo

Odoo no permet peticions Ajax que no vinguen del mateix origen que ell.
Això ho podem canviar en cada **route** amb **cors=\'\***\'

Si volem permetre CORS en tot odoo, el millor és instal·lar Ngingx,
configurar-lo per a permetre CORS i fer que actue com a proxy d\'Odoo.

## Autenticació

En el directori d\'addons d\'Odoo, en el mòdul web/controller, trobem
aquest codi:

``` python
    @http.route('/web/session/authenticate', type='json', auth="none")
    def authenticate(self, db, login, password, base_location=None):
        request.session.authenticate(db, login, password)
        return request.env['ir.http'].session_info()
```

Eixa és la ruta d\'autentificació. Com es veu, accepta un json amb la
base de dades, login, password\...

Si vulguem fer una aplicació que connecte amb Odoo via web, deguem
autenticar-nos. Anem a analitzar el que demana. Per a fer-ho utilitzarem
el programa [Postman](https://www.postman.com/)

En aquest gif es veu el que hem de ficar en el Postman per a veure si
funciona el API:

![](Postmanauthenticationodoo.gif "Postmanauthenticationodoo.gif")

Podem copiar aquest codi per autenticar-nos en la ruta que necessitem.
Cal importar:

``` python
from odoo.http import request
```

Observem que en la resposta va una Cookie que és la sessió. Si en el
postman o en navegador l\'esborrem es perd la sessió.

A partir d\'aquest moment, en Postman podem fer peticions que necessiten
autenticació.

No obstant, si accedim per AJAX en un altre servidor, el navegador no
pot utilitzar la cookie. Per això és té que implementar un sistema de
token que implemente l\'autenticació de forma manual sense el sistema de
Odoo. Una possibilitat és manejar token JWT i hi ha mòduls per a
implementar això en Odoo. En qualsevol cas, per provar es pot generar un
token amb dades aleatòries i enviar-ho al JSON de resposta si l\'usuari
fa login. A partir d\'aquest moment es pot demanar aquest token en totes
les peticions posteriors.

## Controllers amb JSON

Com es veu en l\'exemple anterior, el client ha d\'enviar un JSON en un
format determinat i el servidor també el retorna. Odoo necessita que el
json tinga el format

`{"jsonrpc": "2.0", "params":{...}}`

<https://www.youtube.com/watch?v=wGvuRbCyytk&list=PL5ESsgnHGfa8d3EetmuUA8quawtJjEiH4&index=19&t=713s>

### Exemple complet

Este és el controller:

``` python
     @http.route('/terraform/terraform/create/travel', auth='public', cors='*', type='json')
     def terraform_model_filter(self, p1, p2, player, **kw):
        travel = http.request.env['terraform.travel'].sudo().create({'origin_planet':p1, 'destiny_planet': p2, 'player':player})
        return travel.read()[0]
```

Este és el comandament i el resultat:

``` bash
curl -i -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"call","params":{"player":"1","p1":"8316","p2":"8317"}}' localhost:8069/terraform/terraform/create/travel
HTTP/1.0 200 OK
Content-Type: application/json
Content-Length: 518
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST
Set-Cookie: session_id=e745287b948236557adde062fb0183fb282b181d; Expires=Thu, 04-Mar-2021 08:15:09 GMT; Max-Age=7776000; HttpOnly; Path=/
Server: Werkzeug/0.16.1 Python/3.8.5
Date: Fri, 04 Dec 2020 08:15:09 GMT

{"jsonrpc": "2.0", "id": null, "result": {"id": 4, "name": "Pedro Hdisadlufa -> Fmeeiponovi", "player": [1, "Pedro"], "origin_planet": [8316, "Hdisadlufa"], "destiny_planet": [8317, "Fmeeiponovi"], "distance": 0.1, "percent": 0.18482222222222222, "launch_time": "2020-12-04 08:15:09", "display_name": "Pedro Hdisadlufa -> Fmeeiponovi", "create_uid": [4, "Public user"], "create_date": "2020-12-04 08:15:09", "write_uid": [4, "Public user"], "write_date": "2020-12-04 08:15:09", "__last_update": "2020-12-04 08:15:09"}}
```

### Fer una API Rest

En general, Odoo i la seua documentació estan pensats per a que
utilitzes el seu framework de client web junt en el backend. No obstant,
si volem fer un client web o mòbil que es connecte a Odoo com si fora
una API, cal tindre algunes consideracions:

-   Accedirà d\'una altra URL i farà peticions AJAX, per tant, cal ficar
    **cors=\"\*\"** al decorador dels mètodes del controlador.
-   Al no utilitzar el seu client web, no pot fer ús de csrf, per tant,
    cal desactivar-lo també en el decorador.
-   No podem fer ús de l\'autenticació d\'Odoo, ja que envia una cookie
    però al ser cross-origin tampoc val.
-   Tenim que implementar una autenticació per token propia. Pot ser
    JWT.
-   Cal fer els mètodes adaptats al tipus de métode HTTP que demana el
    client. Ja que en les API REST, el mètode és el *verb* de la
    petició. Així, si demanem un GET serà per llegir, però si és un POST
    serà per guardar.

Ací tenim un exemple funcional al que li falten moltes comprovacions per
evitar errades:

``` python
     @http.route('/terraform/api/<model>', auth="none", cors='*', csrf=False, type='json')
     def api(self, **args):
       print('APIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII')
       print(args, http.request.httprequest.method)
       model = args['model']
       if( http.request.httprequest.method == 'POST'):   #  {"jsonrpc":"2.0","method":"call","params":{"planet":{"name":"Trantor","average_temperature":20},"password":"1234"}}
           record = http.request.env['terraform.'+model].sudo().create(args[model])
           return record.read()
       if( http.request.httprequest.method == 'GET'):
           record = http.request.env['terraform.'+model].sudo().search([('id','=',args[model]['id'])])
           return record.read()
       if( http.request.httprequest.method == 'PUT' or  http.request.httprequest.method == 'PATCH'):
           record = http.request.env['terraform.'+model].sudo().search([('id','=',args[model]['id'])])[0]
           record.write(args[model])
           return record.read()
       if(http.request.httprequest.method == 'DELETE'):
           record = http.request.env['terraform.'+model].sudo().search([('id','=',args[model]['id'])])[0]
           print(record)
           record.unlink()
           return record.read()

       return http.request.env['ir.http'].session_info()
```

Tenim un problema i és que per GET en teoria no es pot enviar body i
aquesta API l\'està esperant al dir que és de tipus json. Si volem fer
una API correcta, tenim que fer una funció diferent per al GET en http i
retornar el JSON, que ha de ser construit dins de la funció.
