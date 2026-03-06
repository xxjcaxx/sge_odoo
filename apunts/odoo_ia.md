# Odoo i la intel·ligència artificial

## Introducció

La integració de la intel·ligència artificial (IA) en Odoo pot millorar significativament l'eficiència i la presa de decisions en les empreses que utilitzen aquesta plataforma.

Odoo community no té els agents de IA que té la versió pro. Aquesta permet crear agents i consultes en llenguatge natural. Si volem utilitzar la IA en Odoo necessitem crear els nostres mòduls. 

Quan parlem de IA en Odoo podem parlar de qualsevol tipus, encara que el primer que pensem són els models generatius de llenguatge com els `Large Language Models` o LLMs. I més concretament els ChatBots com ChatGPT o Gemini, entre altres. Però la IA és més que això i en una empresa podriem estar parlant de IA predictiva en base a xifres de la base de dades o de IA per a la detecció de defectes de fabricació amb visió artificial o aplicada al BI. 

Nosaltres anem a treballar en uns casos molt particulars i intentar generalitzar per saber enfrontar-se a qualsevol adaptació de la IA a l'empresa a través d'un ERP. 


## Comunicar-se amb la IA

La IA moderna té moltes arquitectures. Podem diferenciar entre Xarxes neuronals i Machine learning "tradicional". En qualsevol cas es tracta d'algorismes i funcions matemàtiques molt complexes, però solen estar basades en unes llibreries prou estandarditzades. Això permet exportar una IA con un simple fitxer de números que representen els "pesos" i un codi que representa cóm interpretar una entrada en funció dels pesos i treure una eixida.

Un model de IA en producció és un programa que, com tots, té unes entrades i unes eixides. Eixes entrades i eixides poden ser de moltes formes, com tots: Per entrades del sistema operatiu, sockets, endpoints... Si volem que actue com a servici es por crear un endpoint HTTP amb una API REST, JSON-RPC... Actualment és molt comú connectar-se a APIs de models populars com ChatGPT. Això pot ser molt potent però suposa un cost de tokens, consum elèctric, dependència de serveis externs i donar dades sensibles a altres empreses. Una alternativa és fer l'anomenat self-hosting dels models, ja siga en el núvol o On-Premise. 

Depenent el propòsit, la connexió amb la IA en Odoo pot ser, com hem vist, de moltes maneres i en Odoo es pot enfocar pràcticament de totes elles, ja que és un framework full stack amb Javascript al frontend i Python al backend, les possibilitats són innumerables. Anem a treballar entre cridar a una `API de IA` i els `MCP` com a mètodes estàndard molt útils.

### API REST

Ja siga un servici extern o un propi, aquest mètode implica tenir un servidor HTTP que expose una API a la que se li poden enviar preguntes. Pre crear aquesta API es pot utilitzar VLLM o Ollama, entre altres. Ollama és especialment útil i sencill, així que continuarem en ell en aquest manual. 

Per desplegar `Ollama` és molt fàcil crear un `Docker Compose`. El podem unir al de Odoo o tenir en un servidor independent.

> Conforme el Docker Compose es va fen gran, desplegar tot junt costarà més i el servidor estarà més saturat. És molt perillós `Ollama` depenent del hardware i el model, així que ens podem preguntar si és possible dedicar un servidor independent per la IA. 

Ollama permet desplegar models sols amb un comandament:

Si volem una interfície web per a Ollama podem afegir-la al Docker Compose:

Una vegada està en marxa, per peticions a la API és construir un JSON en el format adequat i enviar a l'endpoint:

Si volem que Odoo envie la petició podem utilitzar llibreries estàndard d'Odoo:

```python
import requests
from odoo import models, fields, api

class AiService(models.Model):
    _name = "ai.service"

    def call_api(self):
        url = "https://api.example.com/generate"
        payload = {"text": "Hola mundo"}

        response = requests.post(url, json=payload)
        data = response.json()

        return data
```

## Exposar un Model

Odoo pot executar models d’intel·ligència artificial perquè funciona sobre Python, així que és possible utilitzar llibreries com *transformers*, *torch* o altres dins d’un mòdul i exposar el resultat mitjançant una API amb els controladors HTTP d’Odoo. No sol ser l’arquitectura més recomanada quan els models són grans o consumeixen molts recursos, ja que pot afectar el rendiment de l’ERP. Per això, en projectes professionals es separa la IA en un servei extern i Odoo només fa les crides a aquesta API. Aquesta integració directa dins d’Odoo té més sentit quan es tracta de models menuts o tasques lleugeres com classificació de textos, recomanacions o càlcul d’embeddings.

### Exposar l'API per Web Controllers

És posible que pugam exposar l'API de forma externa. En aquest cas Odoo fa d'intermediari


### MCP