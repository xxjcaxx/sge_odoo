# Instal·lar Odoo

```{contents}
:local:
:depth: 2
```

Odoo pot ser instal·lat en qualsevol sistema
operatiu. No obstant, es desenvolupa pensant en Ubuntu o Debian i és el
sistema en el que anem a treballar.

Odoo, en esencia, és un servidor web fet en python que es connecta amb
una base de dades postgreSQL. Hi ha moltes maneres d\'instal·lar Odoo,
de les més avançades que són descarregar per *git* el repositori i fer
que arranque a l\'inici a les més simples que són desplegar un
**docker** amb tot funcionant.

## Instal·lar Amb Docker

[Documentació oficial](https://registry.hub.docker.com/_/odoo/)

Desplegar Odoo amb Docker permet instal·lar i gestionar el sistema de manera més senzilla, sense necessitat de configurar manualment dependències o bases de dades. Docker encapsula Odoo en un *contenidor*, que és com una caixa autosuficient amb tot el necessari per a funcionar, fent que siga més fàcil d’executar en qualsevol servidor o ordinador sense problemes de compatibilitat. Això també facilita la creació d’entorns de desenvolupament i producció consistents, permet actualitzacions i proves sense risc d’afectar el sistema principal i optimitza l’ús de recursos. A més, amb Docker és possible desplegar Odoo junt amb altres serveis necessaris, com PostgreSQL, amb un sol fitxer de configuració.

```{admonition} Atenció
:class: danger

En classe treballarem finalment amb Docker Compose, el text següent serveix per entendre la configuració final, però no cal fer-los en el treball diari. La configuració definitiva la farem amb Docker Compose. 
```
https://docs.docker.com/engine/install/ubuntu/

> Si volem GUI, podem utilitzar Docker Desktop per a contenidors locals o Portainer per a gestionar també contenidors remots.

Es pot instal·lar Docker de moltes maneres, però anem a fer-ho de la manera més recomanable per al nostre cas, que és la de la web oficial:

```bash
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

# Instal·lar
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Provar
sudo docker run hello-world

# Gestionar docker sense ser root:
sudo usermod -aG docker $USER

```

En Docker és molt senzill desplegar Odoo, tan sols fa falta aquests
comandaments:

    # docker run -d --restart="always" -e POSTGRES_USER=odoo -e POSTGRES_PASSWORD=odoo --name db postgres:9.4
    # docker run --restart="always" -p 8069:8069 --name odoo --link db:db -t odoo
    # docker stop odoo
    # docker start -a odoo

El primer comandament instal·la el servei Docker. El segon instal·la un
docker PostgreSQL amb una base de dades anomenada *odoo* i de
contrasenya odoo. El tercer crea un docker Odoo vinculat a l\'anterior
base de dades. Per entrar sols cal anar a la **direcció de
l\'amfitrió:8069** ja que el comandament indica que es redireccione per
\[Iptables\] el port 8069 al del contenidor.   

Si fem **ctrl-C** eixim sense parar el contenidor. si volem tornar a
entrar per veure els errors:

    # docker attach odoo


**Creació de mòduls**

Per a fer els nostres mòduls podem crear-los en un directori fora del
docker i executar-lo d\'aquesta manera:

    $ docker run -v /path/to/addons:/mnt/extra-addons -p 8069:8069 --name odoo --link db:db -t odoo

Mentre estem fent nous mòduls, necessitem reiniciar el servici i
arrancar-lo actualitzant un mòdul. Primer deguem parar el docker,
després iniciar-lo indicant que vols entrar a la consola i finalment
actualitzar el mòdul.

    $ docker stop odoo
    $ docker start -a odoo
    $ docker exec odoo odoo --config /etc/odoo/odoo.conf -u nommodul -d nombasededades -r odoo -w odoo --db_host 172.17.0.2 --db_port 5432

Com es veu, l'últim comandament és un poc complicat. Per tant, anem a
fer les coses totalment bé. Per a aixó necessitem un fitxer propi de
configuració d\'Odoo al que anomenarem **odoo.conf**. Podem utilitzar
aquesta plantilla:

    # docker exec odoo cat /etc/odoo/odoo.conf > odoo.conf

El que s\'ha fet és copiar el fitxer que té el docker per defecte. Si
l\'analitzem, no diu bé on està la base de dades, ja que aquesta
informació la passem amb el paràmetre **\--link** del **docker run**.
Nosaltres tenim que crear un directori i ficar dins el fitxer, editar-lo
i afegir aquesta informació:

    db_user = odoo
    db_password = odoo
    db_host = 172.17.0.2
    db_port = 5432

Ara ja podem arrancar el contenidor amb tot:

    # docker stop odoo
    # docker run --volumes-from odoo -v /home/jose/modules/:/mnt/extra-addons -v /home/jose/config/:/etc/odoo -p 8069:8069 --name odoo2 --link db:db -t odoo

Observem que tenim un directori per als nostres mòduls, un altre amb el
fitxer de configuració, la redirecció del port, el nom del nou mòdul,
l\'enllaç a la base de dades i el tipus de container.

Per últim, mentre tenim en marxa el servei, en una altra terminal podem
executar:

    # docker exec odoo odoo -u nommodul -d nombasededades

### Amb Docker Compose

El mètode anterior suposa l\'execució d\'un **docker run** molt complex.
Per evitar equivocar-nos, podem per un [docker
compose](https://docs.docker.com/compose/) com aquest:

```yaml
services:
  odoo:
    container_name: odoo
    image: odoo:18.0
    depends_on:
      - db
    ports:
      - "8069:8069"
    volumes:
      - odoo-web-data:/var/lib/odoo
      - ./config:/etc/odoo
      - ./addons:/mnt/extra-addons
    environment:
      - HOST=db
      - USER=odoo
      - PASSWORD=odoo
    command: --dev=all
    tty: true

  db:
    container_name: postgresql
    image: postgres:15
    environment:
      - POSTGRES_DB=postgres
      - POSTGRES_USER=odoo
      - POSTGRES_PASSWORD=odoo
    volumes:
      - odoo-db-data:/var/lib/postgresql/data

volumes:
  odoo-web-data:
  odoo-db-data:
```

Observem que declarem dos servicis i el **odoo** depèn del **db**. També
cal dir quina xarxa utilitzen i la resta de dades que posem normalment
en el **run**.

Això ha d\'estar en un directori dins d\'un fitxer anomenat
**docker-compose.yml** i sols cal executar cada vegada:

    docker compose up -d

Per a que funcione correctament, necessitem un fitxer `odoo.conf`. Al menys deuria dir on estan els mòduls:

```yml
[options]
addons_path = /mnt/extra-addons
```

Si volem entrar en la base de dades postgreSQL per a fer coses
manualment, podem executar:

    docker exec -ti postgresql psql proves -U odoo


Executem el comandament psql de forma interactiva a la base de dades proves i amb l\'usuari odoo. 

Cal cambé observar que hem associat un volum a les carpetes dels dos contenidors, excepte config i addons. Això permet compartir el codi i la configuració d'Odoo sense compartir massa fitxers o les dades privades de la base de dades. Per compartir sols cal comprimir o posar en Git la carpeta contenidora dels fitxers i carpetes que estem creant.

#### Mode desenvolupador en Docker

Com es pot veure, hem configurat un directori per als mòduls. En aquest directori farem els `scaffold`. Amés hem afegit al comandament `--dev=all`. Això simplifica molt el desenvolupament, ja que molts dels canvis provoquen un reinici del servidor i actualització d'algunes parts dels mòduls. 

L'opció `--dev <feature,feature,...,feature>` en Odoo permet activar diverses característiques útils per al desenvolupament. Aquesta opció **no s'ha d'usar en producció**, ja que està pensada exclusivament per a facilitar la tasca dels desenvolupadors. A continuació, s'expliquen les opcions disponibles:  

- **all**: Activa totes les funcionalitats de desenvolupament descrites a continuació.  
- **xml**: Carrega les plantilles *QWeb* directament des dels fitxers XML en lloc de la base de dades. Si una plantilla es modifica en la base de dades, no es tornarà a carregar des del fitxer XML fins a la pròxima actualització o reinici. A més, les plantilles no es tradueixen quan s’usa aquesta opció.  
- **reload**: Reinicia el servidor automàticament quan es detecta un canvi en un fitxer Python. 
- **qweb**: Permet interrompre l’execució d’una plantilla *QWeb* si un node conté `t-debug="debugger"`, la qual cosa facilita la depuració.  
- **(i)p(u)db**: Activa un depurador de Python (com `pdb`, `ipdb` o `pudb`) quan es produeix un error inesperat, abans de registrar-lo en els logs i retornar-lo.  
- **werkzeug**: Mostra la traça completa de l’error en la pàgina web quan es produeix una excepció, cosa molt útil per a identificar problemes en el codi.  

Aquesta opció és molt útil durant el desenvolupament, ja que facilita la depuració de codi, la càrrega en calent de fitxers i la revisió d’errors de manera més visual. No obstant está limitada en certs aspectes. Per exemple, torna a executar el Python però no crea nous models o fields. Tampoc actualitza tot els XML, sols el contingut de les vistes en `ir.ui.view` que ja s'han enregistrat actualitzant el mòdul. Per tant, no sempre serveix i menys en les etapes inicials de la creació de mòduls. 

Com que el comandament amb `--dev=all` no actualitza la base de dades, la creació de noves vistes, nous models o fields no s'actualitzarà i donarà errades. Una solució és afegir al comandament:

```yaml
    command: ["--dev=all", "-u", "modul", "-d", "basededades"]
```

Però sols quan ja existeix la base de dades i el mòdul està instal·lat. En cas d'arrancar docker amb aquest comandament per primera vegada, es crearà la base de dades amb una confoguració estàndard que no ens interessa en Anglés, sense dades de demo i amb usuari/password admin/admin.


Amés, sols s'executarà quan arranquem el Docker, per tant, cal fer un `docker-compose down` i tornar a arrancar els contenidors de nou. Això suposa molta feina, així que ho podem simplificar afegint a `Visual Studio code` una extensió com `VS Code Action Buttons` i configurant el seu `json` així:

```json
        "commands": [
            {
                "name": "$(triangle-right) Run Odoo",
                "color": "purple",
                "singleInstance": true,
                "command": "sudo docker compose down && sudo docker compose up -d && sudo docker logs odoo -f", 
            },
            {
                "name": "$(triangle-right) Rerun Odoo",
                "color": "purple",
                "singleInstance": true,
                "command": "sudo docker compose restart odoo && sudo docker logs odoo -f", 
            },
        ],
```
El primer `Command` ho reinicia tot, tant la base de dades com Odoo i elimina els contenidors per recrear-los. Això pot solucionar alguns problemes. Però en principi, el segon reinicia només el contenidor Odoo sense recrear-ho. És més ràpid i també actualitza la base de dades. El comandament el podem utilitzar en una terminal si no volem fer els botons o estem en un entorn on hi ha interfície gràfica.  

> Si no necessites ser sudo per executar docker es pot llevar dels comandaments anteriors.

En **Pycharm** és encara més sencill perquè es poden crear en `Run > Edit configurations...` creant un nou `Shell Script` amb els comandaments anteriors.  

Per veure els logs podem fer:

    docker logs odoo -f

```{admonition} Colors en la terminal
:class: tip

Els logs es veuen en color gràcies a posar `tty:true` en el fitxer de configuració.
```

Per fer un mòdul nou:

    docker exec -ti odoo  odoo scaffold proves /mnt/extra-addons
    docker exec -ti odoo chmod 777 -R /mnt/extra-addons/proves


```{admonition} Shell
:class: tip

Si volem executar el `shell` de Odoo podem ejecutar el comandament:


    docker compose exec odoo odoo shell -d proves --db_host db --db_password odoo


Ací estem diguen que execute al contenidor odoo el comandament odoo especificant la base de dades i el host i password de postgres. És necessari especificar la base de dades perquè Docker Compose crea múltiples contenidors Docker basant-se en la configuració del fitxer `docker-compose.yml`. En aquest cas, hi ha diversos contenidors en execució, un que corre **Odoo**, un altre que corre **PostgreSQL**, i possiblement altres més.  

Cada contenidor és una màquina virtual separada amb la seua pròpia adreça IP, per la qual cosa si executes aquesta comanda:  


    docker exec -it odoo_odoo_1 bash -c "odoo shell -d postgres"

  
Odoo intentarà connectar-se a la base de dades **usant `localhost`**, però en aquest context, `localhost` es refereix al propi contenidor d’Odoo, no al de PostgreSQL.  

Per a solucionar-ho, has d’indicar explícitament el **host de la base de dades** i la **contrasenya** en la comanda
```

#### Git i Odoo en Docker

És important configurar un bon `.gitignore`:

```yml
# Python
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
.env
venv/
.envrc
*.egg-info/
.eggs/

# VSCode / IDEs
.vscode/
.idea/
*.iml

# System files
.DS_Store
Thumbs.db

# Docker volumes (si els mapejes localment)
data/
filestore/
sessions/

# Tests / coverage
.coverage
htmlcov/
pytest_cache/
```

Com que els volumns de la base de dades i del propi Odoo no van a estar a la carpeta, no cal ignorar l'instal·lació d'Odoo. Es pot crear un repositori en Github i després configurar la carpeta sencera amb `docker-compose.yml`, el directori config, nginx o addons, per exemple. Al descarregar el repositori es generará un entorn de treball igual que l'original, però sense les dades de la base de dades. 

## Posar en producció amb docker

Si podem deixar correguent un Docker a un servidor amb connexió a Internet amb els ports exposats, ja estaria en producció. No obstant això suposa varis problemes de seguretat i rendiment. 

### Docker de Nginx

Podem afegir al fitxer del Docker Compose la configuració d'un contenidor Nginx. Aquest implementarà HTTPS i farà de proxy a Odoo.

Farem servir un fitxer Dockerfile basat en la imatge oficial de Nginx, però adaptada a les nostres necessitats. Els certificats es generen de manera automàtica i estan autofirmats.

Encara que els navegadors mostren un avís d’error, la informació continua viatjant de forma segura. El que passa és que no hi ha cap autoritat certificadora que haja validat el certificat. (no és el mateix un certificat autofirmat que cap protecció).

Es podria fer un script amb CertBot per a utilitzar Let's Encrypt i renovar el certificat cada tres mesos.

En Nginx, definim la mateixa carpeta per a HTTP i HTTPS, intentant simplificar al màxim la configuració i automatitzar la creació tant de la imatge com del contenidor amb scripts.

El primer pas és crear la nostra clau i certificat autofirmat dins d'un directori nginx junt a la resta de fitxers dels dockers:

```bash
mkdir nginx
cd nginx
openssl req -x509 -sha256 -nodes -newkey rsa:2048 -keyout ser.key -out ser.pem
```

Després creem un `Dockerfile` dins de la mateixa carpeta. Aquest fixter servirà per executar certs comandaments cada vegada que es llance el docker:

```bash
FROM nginx

RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/
COPY ser.key /etc/nginx/
COPY ser.pem /etc/nginx/

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
```

Afegirem al `docker-compose.yml`:

```yaml
  nginx:
    build:
      context: ./nginx
      dockerfile: Dockerfile  # este campo es opcional si el archivo se llama así
    container_name: nginx
    depends_on:
      - odoo
    ports:
      - "80:80"
      - "443:443"
```
Falta crear el `nginx.conf` que serà la configuració:

```nginx
 #odoo server
    upstream odoo {
     server odoo:8069;
    }
    upstream odoochat {
     server odoo:8072;
    }
    # S'han definit els upstream a localhost i als port determinats

    # http -> https (totes les peticions per HTTP se reformulen a HTTPS)
    server {
       listen 80;
       server_name _;                            
       # Si tinguerem nom de domini el ficariem, en altre cas: _
       rewrite ^(.*) https://$host$1 permanent;
    }

    server {
     listen 443 ssl;
     server_name _;
     # La _ perquè en l'exemple no tenim domini, com dalt
     proxy_read_timeout 720s;
     proxy_connect_timeout 720s;
     proxy_send_timeout 720s;

     # Add Headers for odoo proxy mode
     proxy_set_header X-Forwarded-Host $host;
     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
     proxy_set_header X-Forwarded-Proto $scheme;
     proxy_set_header X-Real-IP $remote_addr;

     # SSL parameters
     ssl_certificate /etc/nginx/ser.pem;
     ssl_certificate_key /etc/nginx/ser.key;
     # IMPORTANT: ficar bé les rutes dels certificats
     ssl_session_timeout 30m;
     ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
     ssl_ciphers 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-DSS-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-DSS-AES128-SHA256:DHE-RSA-AES256-SHA256:DHE-DSS-AES256-SHA:DHE-RSA-AES256-SHA:AES128-GCM-SHA256:AES256-GCM-SHA384:AES128-SHA256:AES256-SHA256:AES128-SHA:AES256-SHA:AES:CAMELLIA:DES-CBC3-SHA:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!aECDH:!EDH-DSS-DES-CBC3-SHA:!EDH-RSA-DES-CBC3-SHA:!KRB5-DES-CBC3-SHA';
     ssl_prefer_server_ciphers on;

     # log
     access_log /var/log/nginx/odoo.access.log;
     error_log /var/log/nginx/odoo.error.log;

     # Redirect requests to odoo backend server
     location / {
       proxy_redirect off;
       proxy_pass http://odoo;
     }
     location /longpolling {
         proxy_pass http://odoochat;
     }

     # common gzip
     gzip_types text/css text/less text/plain text/xml application/xml application/json application/javascript;
     gzip on;
    }
```

### Workers

Per defecte Odoo és `multithread`. Això vol dir que pot mantenir varis fils d'execució. No obstant això és un poc ineficient en producció si tens molts usuaris. És millor, amés, que siga `multi-processing` per poder distribuir la tasca millor entre distints processadors o nuclis. (no disponible en Windows)

Per aconseguir-ho, sols hem de ficar al fitxer de configuració la quantitat de `workers` que volem, amés d'altres coses:

```yaml
[options]
limit_memory_hard = 1677721600
limit_memory_soft = 629145600
limit_request = 8192
limit_time_cpu = 600
limit_time_real = 1200
max_cron_threads = 1
workers = 8
```

Com a regla aproximada podem calcular els workers òptims com 1 Worker per cada 6 usuaris simultanis i El doble + 1 de workers per CPU. Així, si tenim un servidor amb 4 nuclis 8 Threads i uns 60 usuaris simultanis:

* 60/6 ~= 10 workers
* 4*2+1 = 9 workers que suporta la màquina. 
* En aquest cas es poden utilitzar 8 workers + 1 per al cron. 
* La RAM a nivell simple podem pensar en 1GB per worker. No obstant, hi ha peticions que no necessiten més de 150MB. Per tant, segon la documentació d'Odoo, per a 9 workers: 9 * ((0.8*150) + (0.2*1024)) ~= 3GB RAM mínim.

    
### On instal·lar Odoo?

Cada empresa té unes necessitats i aquesta pregunta pot tenir moltes respostes. Anem a fer una comparativa no rigorosa de les distintes opcions:

| **Lloc**           | **Tecnologia**                         | **Propòsit**                                                                                                                                                                                                                                                                                                                                                         |
| ------------------ | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Servidor local** | Directament instal·lat a Ubuntu Server | En funció de la potència, capacitat i seguretat del servidor, pot servir per a qualsevol empresa. Instal·lar directament dona menys flexibilitat, però aprofita tota la potència de la màquina i la compatibilitat amb tot. L'empresa té control total de les dades i és responsable de la seguretat. També té control de les despeses. És poc escalable i migrable. |
| **Servidor local** | En Docker, Proxmox o VirtualBox        | Igual que l'opció anterior, però amb més possibilitats de ser escalable i migrable. Permet compartir millor els recursos de la màquina amb altres serveis.                                                                                                                                                                                                           |
| **Al núvol**       | VPS                                    | No és necessari pensar en la seguretat física, però sí en la lògica. És escalable si el proveïdor permet ampliar la màquina. El preu sol estar predeterminat, però és més car a la llarga que els servidors propis. En el cas de proveïdors primaris com AWS, Azure, Google Cloud... el preu és per ús i és perillós no controlar-ho.                                |
| **Al núvol**       | SAAS                        | Ja no cal tanta cura en la seguretat lògica, només pels usuaris d'Odoo. És escalable, però molt més car. No és personalitzable.                                                                                                                                                                                                                                      |
| **Al núvol**       | Odoo.sh                         | Permet desplegar el teu Odoo a un IaaS + PaaS preparat específicament per a Odoo. Permet personalitzar. És car.                                                                                                                                                                                                                                       |
| **Al núvol**       | PAAS (Render, Railway, Fly.io...)             | Cada servei té les seues característiques, però combinen els avantatges de Docker pel que fa a la personalització amb una interfície molt còmoda per al DevOps i CI/CD. Es tracta el desplegament com si fos codi.                                                                                                                                                   |



La resposta continúa sense ser clara. Cada empresa té unes posibilitats i necessitats. Una micro-empresa amb pocs ordinadors i sols necessitar de intranet pot instal·lar en un Docker en un servidor de baix consum amb copies de seguretat periòdiques. Una empresa menuda pot desplegar en VPS o PAAS amb preus predefinits i controlats i anar augmentant conforme ho necessiten. Una empresa més gran pot decidir-se per núvols més de baix nivell (IAAS) o per una instal·lació on-premise més seria amb alta disponibilitat a la propia empresa. Un SAAS pot ser útil per a empreses que no necessiten cap personalització. Si el negoci és donar el propi servei d'Odoo, es pot optar per contractar un IAAS i a sobre, donar un servei SAAS amb personalitzacions a mida i cobrar pel servei i per les personalitzacions.


## Instal·lar en Debian i Ubuntu

Abans de res, cal preparar un poc el sistema:

En el cas de Ubuntu o Debian, que és el que ens interessa,
Odoo proporciona uns repositoris anomenats
**Nightly**, que poden ser afegits al **sources.list** per instal·lar de
manera automàtica tot. Aquests respositoris són actualitzats cada nit.
Per tant, és possible que al llarg del temps, algunes funcions o arxius
canvien si actualitzem.

En principi tot ha de funcionar com diuen en els manuals, però si tenim
que utilitzar utf-8 per l\'idioma, tenim que fer algunes coses abans.

Abans de res, es possible que Debian o ubuntu no tinga bé els
**locales**. Es pot fer en:

     # dpkg-reconfigure locales

I seleccionar els de es_ES i el de UTF8 per defecte. Cal eixir de sessió
i tornar a entrar.

Si dpkg-reconfigure no mostra un asistent, pots fer:

     # locale-gen "es_ES.UTF-8"
     # dpkg-reconfigure locales

Enllaç als repositoris: <https://nightly.odoo.com/>

I com en el propi manual diu, es pot fer tot en aquests comandaments (el
primer si estem en Debian):

     # sudo apt-get install ca-certificates
     # wget -O - https://nightly.odoo.com/odoo.key | apt-key add -
     # echo "deb http://nightly.odoo.com/17.0/nightly/deb/ ./" >> /etc/apt/sources.list
     # apt-get update && apt-get install odoo

Aquests comandaments el que fan és instal·lar els certificats que els
navegadors o, en aquest cas, wget necessiten per admetre HTTPS, a
continuació, descarrega el certificat, afegeix el repositori i instal·la
l\'Odoo.

A continuació, cal anar a la direcció en el navegador:

    http://<ip o url>:8069

[Asciinema del procés](https://asciinema.org/a/122875).

### Configuració de la ruta dels mòduls

Com que la instalació d\'Odoo crea lúsuari **odoo**, que és el que tenim
que utilitzar per al desenvolupament, anem a donar-li una contrasenya:

    $ sudo passwd odoo
    $ sudo usermod -s /bin/bash odoo

```{admonition} Atenció
:class: warning
 
A partir d'aquest moments, tots els comandaments s'han de fer amb l'usuari odoo.
```
La configuració del servidor Odoo té una opció que es diu
**addons-path**. Nosaltres poden afegir més rutes per als nostres addons
personalitzats. Es pot deixar de manera definitiva en el fitxer de
configuració o iniciar el servidor indicant quina és la ruta dels
addons:

     $ odoo -d demodb --addons-path="<ruta>"

Si volem que quede guardat de manera definitiva, cal afegit **\--save**
al comandament. Els comandaments són queda, per tant:

     $ mkdir /var/lib/odoo/modules
     $ odoo scaffold proves /var/lib/odoo/modules
     $ odoo --addons-path="/var/lib/odoo/modules,/usr/lib/python3/dist-packages/odoo/addons" --save

```{admonition} Nota
:class: tip
 
L'opció --save guarda la configuració en $HOME/.odoorc, que és un fitxer per a l'usuari odoo. Si volem que siga per a tots els usuaris que puguen executar el servidor odoo, es pot ficar en el fixter de /etc/odoo
```
### Depurar Odoo

Per crear mòduls o vorer els problemes que estan passant, cal llegir els
fitxers de log, però hi ha una manera més eficient de fer-ho. Si
observem el comandament que, realment, està executant odoo:

`python3 /usr/bin/odoo --config /etc/odoo/odoo.conf --logfile /var/log/odoo/odoo-server.log`

Podem observar que diu que \--logofile va a un fitxer. Si parem el
servici amb:

     # systemctl stop odoo
    o
     # /etc/init.d/odoo stop

Podem iniciar sessió amb l\'usuari odoo (cal fer que puga iniciar sessió
en Linux) i executar:

     odoo --config /etc/odoo/odoo.conf

D\'aquesta manera, en temps real, va apareguent els missatges que dona
el servidor.

Si volem, amés, actualizar un mòdul al arrancar, podem especificar quina
base de dades i quin mòdul a actualitzar:

     odoo --config /etc/odoo/odoo.conf -u mòdul -d empresa

Pot ser que el nostre usuari odoo tinga una configració personalitzada.
En aquest cas, cal fer, per exemple:

     $ odoo --config /var/lib/odoo/.odoorc -d empresa -u modul

De fet, una vegada fet el \--save, cada vegada que cridem al comandament
**odoo** busca el .odoorc al directori personal de l\'usuari. Per tant,
sols cal fer:

     $ odoo -d empresa -u modul

Amés, podem modificar el nivell de log amb l\'opció \--log-level, per
exemple: \--log-level=debug

[Asccinema amb tots els passos per
depurar.](https://asciinema.org/a/122901)

Per saber més, pots anar a l\'ajuda:

     $ odoo --help

O a aquesta web:
<https://www.odoo.com/documentation/12.0/reference/cmdline.html>


### Millorar l\'eixida de Log

Per afegir als nostres mètodes una eixida de log i facilitar la
depuració, es pot utilitzar el api de Odoo:

Al principi del fitxer .py:

``` python
from openerp import models, fields, api
import logging

_logger = logging.getLogger(__name__)
```

Per dins de les funcions:

``` python
    _logger.debug("Use _logger.debug for debugging purposes, nothing else.")
    _logger.info("Use _logger.info for information messages. This is used for notifying about something important.")
    _logger.warning("Use _logger.warning for minor issues, which will not crash your module.")
    _logger.error("Use _logger.error to report a failed operation.")
    _logger.critical("Use _logger.critical for critical message: when this goes off the module will not work anymore.")
    #Want to include data from your field? Pass it along in the context, get it from the pool or from the dict.
    _logger.critical("The name '" + str(record.get('name')) + "' is not okay for us!")
```

### Opcions de log

Per defecte, Odoo llança el seu log a un fitxer a **/var/log/odoo/**,
però es pot fer que envía a un altre fitxer amb **\--log-file=LOGFILE**.

Si volem més detall en determinats accions d\'Odoo, podem afegir al
comandament les següents opcions:

-   **\--log-request**: Mostra les peticions **RPC** (remote procedure
    call) fetes per l\'http des del client.
-   **\--log-response**: Mostra el contingut de la resposta que dona el
    servidor a les peticions anteriors. Molt útil per saber què està
    enviant i cóm ho interpreta el client.
-   **\--log-web**: Dona més detalls de totes les peticions GET o POST
    que es donen a la web.
-   **\--log-sql**: Mostra el sql que llança al servidor PostgreSQL.
    Aquesta opció ens ajuda a entendre cóm funciona el ORM.
-   **\--log-level=LOG_LEVEL**

```python
  ['info', 'debug_rpc', 'warn', 'test', 'critical',
  'debug_sql', 'error', 'debug', 'debug_rpc_answer',
 'notset'].
```

### Debug mode

Odoo permet entrar en mode debug amb **\--debug**.

També es pot importar la bibliteca **pdb** i col·locar un *trace* en el
codi que ens interessa:

``` python
    import pdb
    ...
    pdb.set_trace()
```

Una vegada dins, es poden utilitzar els comandaments de pdb:
<https://docs.python.org/3/library/pdb.html>

### Posar en producció en Ubuntu

<https://www.odoo.com/documentation/17.0/administration/install/deploy.html?highlight=workers>
https://docs.docker.com/engine/install/linux-postinstall/#configure-docker-to-start-on-boot-with-systemd


### Odoo per HTTPS

El servidor Odoo per defecte dona la seua web pel port 8069 i en HTTP
sense capa de seguretat SSL.

Per fer que tinga eixa seguretat, necessitem utilitzar un servidor web
que faça de proxy i proporcione la connectivitat per HTTPS.

Situació inicial:

     ------------             ------------
    |          |         8069|          |
    |  Client  |<----------->| Server   |
    |          |             | Odoo     |
    ------------             ------------

    Situació que busquem:

    ------------             --------------------
    |          |         443 |                  |
    |  Client  |<----------->| Nginx <--┐       |
    |          |             |          |       |
    ------------             |          |8069   |
                             |          v       |
                             |        ------    |
                             |        |Odoo|    |
                             |        ------    |
                             --------------------

Tots els servicis que utilitzen SSL necessiten un certificat. En una
situació ideal, tenim un certificat signat per una entitat
certificadora. Si no, tenim que crear en nostre autosignat.

[tutorial del
certificat](https://www.digitalocean.com/community/tutorials/how-to-create-a-self-signed-ssl-certificate-for-nginx-in-ubuntu-16-04)

    # openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/odoo-selfsigned.key -out /etc/ssl/certs/odoo-selfsigned.crt
    Generating a 2048 bit RSA private key
    ...........................................................................................................+++
    ...........................................................................................+++
    writing new private key to '/etc/ssl/private/odoo-selfsigned.key'
    -----
    You are about to be asked to enter information that will be incorporated
    into your certificate request.
    What you are about to enter is what is called a Distinguished Name or a DN.
    There are quite a few fields but you can leave some blank
    For some fields there will be a default value,
    If you enter '.', the field will be left blank.
    -----
    Country Name (2 letter code) [AU]:ES
    State or Province Name (full name) [Some-State]:Valencia
    Locality Name (eg, city) []: Xàtiva
    Organization Name (eg, company) [Internet Widgits Pty Ltd]:
    Organizational Unit Name (eg, section) []:
    Common Name (e.g. server FQDN or YOUR name) []: nom o domini
    Email Address []: correu@servidor.com

A continuació cal configurar el https en Nginx per a fer de proxy en
Odoo. [manual
oficial](https://www.odoo.com/documentation/9.0/setup/deploy.html#https)

En /etc/odoo.conf:

     proxy_mode = True 

En /etc/nginx/sites-enabled/odoo.conf:

    #odoo server
    upstream odoo {
     server 127.0.0.1:8069;
    }
    upstream odoochat {
     server 127.0.0.1:8072;
    }
    # S'han definit els upstream a localhost i als port determinats

    # http -> https (totes les peticions per HTTP se reformulen a HTTPS)
    server {
       listen 80;
       server_name _;                            
       # Si tinguerem nom de domini el ficariem, en altre cas: _
       rewrite ^(.*) https://$host$1 permanent;
    }

    server {
     listen 443;
     server_name _;
     # La _ perquè en l'exemple no tenim domini, com dalt
     proxy_read_timeout 720s;
     proxy_connect_timeout 720s;
     proxy_send_timeout 720s;

     # Add Headers for odoo proxy mode
     proxy_set_header X-Forwarded-Host $host;
     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
     proxy_set_header X-Forwarded-Proto $scheme;
     proxy_set_header X-Real-IP $remote_addr;

     # SSL parameters
     ssl on;
     ssl_certificate /etc/ssl/certs/odoo-selfsigned.crt;
     ssl_certificate_key /etc/ssl/private/odoo-selfsigned.key ;
     # IMPORTANT: ficar bé les rutes dels certificats
     ssl_session_timeout 30m;
     ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
     ssl_ciphers 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-DSS-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-DSS-AES128-SHA256:DHE-RSA-AES256-SHA256:DHE-DSS-AES256-SHA:DHE-RSA-AES256-SHA:AES128-GCM-SHA256:AES256-GCM-SHA384:AES128-SHA256:AES256-SHA256:AES128-SHA:AES256-SHA:AES:CAMELLIA:DES-CBC3-SHA:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!aECDH:!EDH-DSS-DES-CBC3-SHA:!EDH-RSA-DES-CBC3-SHA:!KRB5-DES-CBC3-SHA';
     ssl_prefer_server_ciphers on;

     # log
     access_log /var/log/nginx/odoo.access.log;
     error_log /var/log/nginx/odoo.error.log;

     # Redirect requests to odoo backend server
     location / {
       proxy_redirect off;
       proxy_pass http://odoo;
     }
     location /longpolling {
         proxy_pass http://odoochat;
     }

     # common gzip
     gzip_types text/css text/less text/plain text/xml application/xml application/json application/javascript;
     gzip on;
    }

També cal esborrar el **default** de sites-enables de nginx o
modificar-lo per a que no afecte al port 80 d\'Odoo.

Ara es reinicien tanmt Odoo com nginx

## Seguretat en Odoo

Quan parlem de seguretat en Odoo estem parlant de temes generals que totes les aplicacions web tenen i de temes específics d’Odoo. En general, qualsevol aplicació web té uns mínims de seguretat que passen per donar servici sols en HTTPS, controlar els ports, evitar atacs DDOS, tenir bones contrasenyes… 

En quant al HTTPS, en els apartats corresponents està explicat, a falta de contractar un certificat real. La seguretat i alta disponibilitat del servidor és una qüestió massa complexa per a aquest mòdul i pot ser tasca del cicle d’ASIX. Però podem fer coses específiques d’Odoo per evitar els problemes o per a recuperar-se ràpidament d’ells. 

### Persistència de les dades

Una empresa no es pot permetre perdre dades. Les formes d’evitar perdre dades en Odoo són múltiples. Si tenim una instal·lació on-premise hem de controlar tots els factors: físics i lògics. Això passa per varies tasques ineludibles:

#### Còpies de seguretat

Odoo, en la seua interfície gràfica, permet exportar taules i un cert control de les còpies de seguretat manuals per taules individuals. Això, per suposat, sols és recomanable per a exportacions/importacions puntuals. 

En l’interfície gràfica també es pot anar al gestor de bases de dades i exportar i importar el backup. Seria recomanable fer-ho cada cert temps. 

Si volem que siga automàtic, es pot programar externament un servici que, cada cert temps, es connecte de forma remota per XML-RCP:
```python
import requests

odoo_host = 'http://localhost:8069'
database = 'tu_basededatos'
admin_password = 'tu_contraseña_admin'

url = f'{odoo_host}/web/database/backup'

payload = {
	'master_pwd': admin_password,
	'name': database,
	'backup_format': 'zip'  # o 'dump'
}

response = requests.post(url, data=payload)

if response.status_code == 200:
	filename = f"{database}_backup.zip"
	with open(filename, 'wb') as f:
    	f.write(response.content)
	print(f"Backup guardado como {filename}")
else:
	print(f"Error al hacer backup: {response.status_code} - {response.text}")
```

També podem fer-ho a nivel del CLI de la base de dades:

```bash
pg_dump db_name
```

La copia de seguretat de la base de dades no inclou els fitxers i fotos. Necessitarem copiar el directori filestore si ho fem a nivell de base de dades. 

A més baix nivell, es pot fer una copia de seguretat del sistema d’arxius o inclús de les particions. 

No cal dir que eixa copia de seguretat no estarà finalment en el mateix disc dur que la base de dades original ni en la mateixa ubicació física. 

### Alta disponibilitat

Un sistema empresarial ha d’estar sobre un servidor segur a nivell físic. Això implica SAIs i RAIDs o similars. Si estem utilitzant un VPS en el núvol, no ens preocuparem d’això. Si no, necessitarem un CPD encara que siga discret, amb seguretat física, sistemes d’alimentació ininterrompuda i discs redundants. Amés de sistemes de còpies de seguretat remotes. El sistema es deuria poder recuperar d’un trencament sense interrompre el servici.

### Usuaris i permisos

Odoo té un complex sistema d’usuaris, grups, rols i permisos. Un/a administrador d’Odoo ha de portar al dia la gestió granular d’aquests permisos. Amés, deguem distingir els disitints usuaris que tenim que gestionar, de més poderos a menys:

- Root del sistema operatiu: Usuari amb poder total en aquest sistema operatiu, deuria ser un administrador de sistemes.
- Administrador de PostgreSQL: té molt de poder amb les dades de tota l’empresa i possiblement de varies empreses. Si PostgreSQL està utilitzant-se per a altres coses que no són Odoo també té poder sobre elles. 
- Administrador de bases de dades d’Odoo: La seua contrasenya està en odoo.conf i té poder de crear, esborrar i fer còpies de totes les bases de dades. Accedeix típicament via web. És possible que els programadors no necessiten aquest poder.
- Administrador técnic d’una base de dades: Té poder per administrar mòduls i per canviar l’interfície. Els programadors necessiten eixe poder.
- Administrador de l’empresa: Pot administrar tot el que és relatiu al negoci. No pot instal·lar mòduls ni programar. Típicament són els propietaris, jefes… de l’empresa. No és convenient que una persona no experimentada en programació tinga més poder.
- Usuaris normals: Venedors, administratius… Poden accedir a certes parts de backend. Els seus permisos depenen del grup o rols al que estiguen associats.
- Clients i proveidors: Normalment tenen accés a la pàgina web, que pot estar feta amb Odoo. Poden tenir cert accés a una API feta per nosaltres si volem automatizar les relacions comercials amb ells.


## Creació de una base de dades

```{admonition} Atenció
:class: tip

En general no cal fer aquest pas i és recomanable fer la base de dades per la interfície web.
```
En l\'usuari de odoo, creem una base de dades i li apliquem l\'esquema
de dades de Odoo:

     $ createdb --encoding=UTF-8 --template=template0 testdb
     $ odoo -d testdb

Aixó crea una base de dades amb les dades de prova per començar a
treballar.

Per defecte, l\'usuari serà admin amb contrasenya admin.

[Comandaments bàsics de
postgreSQL](https://gist.github.com/Kartones/dd3ff5ec5ea238d4c546)

## Errors documentats

```{admonition} Atenció
:class: tip

**Important** Abans de fer aquests comandaments, consulteu el final del
fitxer de log, generalment en /var/log/odoo/odoo-server.log
```
### Error amb el rol Odoo

Si apareix un error similar a:

`OperationalError: FATAL:  no existe el rol «odoo»`\
`OperationalError: FATAL:  role "odoo" does not exist`

Cal fer el comandament:

     su - postgres -c "createuser -s odoo"

Això crea l\'usuari odoo amb permís de superusuari (-s)

### Error amb UTF-8 

Moltes vegades, al instal·lar, no configura el template0 de la base de
dades en utf-8.
[1](http://www.postgresql.org/docs/9.3/static/manage-ag-templatedbs.html)

Es soluciona esborrant i tornant a crear la base de dades template1
utilitzant la codificació UTF8.
[2](https://gist.github.com/ffmike/877447)

     # su postgres
     $ psql
     postgres=# update pg_database set datallowconn = TRUE where datname = 'template0';
     postgres=# \c template0
     template0=# update pg_database set datistemplate = FALSE where datname = 'template1';
     template0=# drop database template1;
     template0=# create database template1 with template = template0 encoding = 'UTF8';
     template0=# update pg_database set datistemplate = TRUE where datname = 'template1';
     template0=# \c template1
     template1=# update pg_database set datallowconn = FALSE where datname = 'template0';

Pot ser que no es cree el cluster de postgresql. Primer cal reconfigurar
els locales y després:

     pg_createcluster 9.4 main --start

### Recuperar la contrasenya de l\'administrador

**De l\'administrador d\'un base de dades:** Dins de la base de dades:

     update res_users set password='test' where login='admin';

**De l\'administrador d\'Odoo**

Si no pots administrar o crear noves bases de dades, cal modficar la
línia **admin_passwd** de /etc/odoo/odoo.conf o .odoorc, depenent quin
fitxer de configuració estem utilitzant.

### Problemes en els repositoris oficials d\'ubuntu

En el cas de l\'IES, els repositoris oficials no funcionen bé per alguna
interferència amb els de Lliurex. Cal canviar-los. Per exemple per els
de Caliu. Una manera és entrar en **vim** i executar aquest comandament:

     :%s_http://archive.ubuntu.com/ubuntu_http://ftp.udc.es/ubuntu/_         

(Utilitzem \_ en compte de / en la subtitució perquè la / ja està en les
URL.)

### No connecta amb PostgreSQL 

Pot ser perquè no está el servici en funcionament.

     service postgresql [restart,start,stop,status]         

En cas de que falle, podem veure el log:

     cat /var/log/postrgresql/(versio)...        

De vegades la base de dades queda corrupta. Es pot intentar recuperar
amb:

     su - postgres -c '/usr/lib/postgresql/12/bin/pg_resetwal -f /var/lib/postgresql/12/main'

Si s\'han perdut dades, no són molt importants o tenim còpia de
seguretat, tal vegada cal eliminar la base de dades de la empresa que no
funciona:

     postgres$ psql
     psql> drop database <base de dades>;

## Enllaços


-   [Manual technical training
Odoo](https://github.com/odoo/technical-training/tree/12.0-99-sysadmin).
-   [Video de instalar Odoo
    manualmente](https://www.youtube.com/watch?v=IPjqbwA814Q).
-   [Video de configurar Odoo como
    servicio](https://www.youtube.com/watch?v=36XolOPbOFI).
-   [Vídeo de Copias de
    seguridad](https://www.youtube.com/watch?v=AvMXfYAD0PA).
