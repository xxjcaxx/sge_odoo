# Automatizacions amb Odoo

## Automated actions i Webhooks

Odoo té una funcionalitat integrada que permet crear accions automatitzades basades en esdeveniments. Aquestes accions es poden configurar per a executar-se quan es produeix un esdeveniment específic, com ara la creació d'un registre, la modificació d'un registre o la supressió d'un registre. Aquestes accions poden ser molt útils per a automatitzar processos interns dins d'Odoo. Per exemple, es pot configurar una acció automatitzada per a enviar un correu electrònic a un client quan es crea una nova ordre de venda.

Es necessita instal·lar el mòdul `Automated Actions` (base_automation). 

A més de les accions automatitzades, Odoo també permet configurar webhooks. Un webhook és una manera de rebre notificacions en temps real quan es produeix un esdeveniment específic en Odoo. Per exemple, es pot configurar un webhook per a rebre una notificació cada vegada que es crea una nova ordre de venda. Aquesta notificació es pot utilitzar per a desencadenar altres processos externs a Odoo, com ara actualitzar un sistema de gestió de relacions amb clients (CRM) o enviar una notificació a un canal de comunicació com Slack. Els webhooks es configuren en les automatitzacions anteriors. Quan es crea una acció automatitzada, es pot seleccionar l'opció de "Trigger Webhook" i especificar la URL del webhook al qual s'enviarà la notificació quan es produeixi l'esdeveniment.



## Odoo i n8n

Per a automatitzar processos amb `Odoo` es pot incorporar una ferramenta de fluxos de treball que treballa amb un sistema low code. D'aquesta manera, inclús usuaris no tècnics poden crear automatitzacions i integracions entre Odoo i altres aplicacions.

N8n es pot instal·lar `on premise`, en el nuvol o en el seu servei en el nuvol. En el nostre cas anem a instal·lar-lo en un servidor on premise. Per a això, es pot utilitzar `Docker`, que facilita la instal·lació i gestió de l'aplicació.

### Instal·lació de n8n amb Docker

n8n utilitza `Nodejs`, per tant, sols amb `npm` es pot instal·lar. No obstant, la manera més senzilla d'instal·lar n8n és utilitzant Docker, ja que no cal preocupar-se per les dependències i la configuració del sistema. A més, Docker permet gestionar fàcilment les actualitzacions i les còpies de seguretat.

Es pot afegir al Docker compose d'Odoo un nou servei n8n.

> A aquestes altures del curs és possible que el Docker compose ja tinga Odoo, postgreSQL, nginx o inclús Ollama, Jupyter, entre altres. No hi ha cap problema en concentrar tots aquests serveis en un mateix Docker compose, sempre que es gestionen correctament els ports i les xarxes. No obstant, cal pensar en els recursos del servidor, ja que cada servei consumeix memòria i CPU. Si el servidor té recursos limitats, pot ser millor separa els serveis en diferents màquines. Si estem treballant en una IaaS també cal pensar en el preu de diversos servidors menuts front a la reserva d'un servidor més potent.

El manual oficial (https://docs.n8n.io/hosting/installation/server-setups/docker-compose/#6-create-docker-compose-file ) dona un fitxer de composició molt complet i segur. Si el nostre n8n ha d'estar a internet cal seguir-lo, però per a fer proves és més sencill:

```yaml
services:
  n8n:
    image: docker.n8n.io/n8nio/n8n
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - NODE_ENV=production
      - GENERIC_TIMEZONE=Europe/Madrid
      - TZ=Europe/Madrid
    volumes:
      - n8n_data:/home/node/.n8n
      - ./local-files:/files

volumes:
  n8n_data:
```

Al posar-lo en marxa, n8n estarà disponible a `http://<ip>:5678`. Ens demana registrar a l'administrador.

#### Solució de problemes

Si no recordem la contrasenya la podem restablir amb el següent comandament:

```bash
docker compose exec n8n n8n user-management:reset
```

> En general n8n dins del docker és un comandament del CLI que té moltes opcions. Al manual oficial estàn totes disponibles. 


## Integració d'Odoo amb n8n

> Abans de començar amb Odoo i n8n seria interessant fer algun `workflow` més senzill. A la web oficial hi ha molts templates per anar practicant. 

Per a integrar Odoo amb n8n, es pot utilitzar el connector d'Odoo que n8n ofereix. Els oficials de n8n són connectors genèrics, per tant, no tenen totes les funcionalitats d'Odoo, però permeten fer moltes coses. Si necessitem alguna funcionalitat específica que no està disponible en el connector oficial, es pot crear un connector personalitzat utilitzant l'API d'Odoo.


### Connector personalitzat d'Odoo amb JSON-2

Com que el connector oficial d'Odoo no té totes les funcionalitats, es pot crear un connector personalitzat utilitzant l'API d'Odoo. Per a això, es pot utilitzar el node `HTTP Request` de n8n per a fer peticions a l'API d'Odoo.

JSON-2 utilitza peticions HTTP POST a endpoints generats per Odoo a cada model. En aquestes peticions s'especifica el métode a executar. Tots els models tenen uns endpoints base, però també es poden crear endpoints personalitzats per a funcionalitats específiques creant mètodes. D'aquesta manera es pot delegar part de l'automatització a Odoo, i n8n només s'encarrega de fer les peticions i gestionar els fluxos de treball.
