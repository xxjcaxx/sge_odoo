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

Ja siga un servici extern o un propi, aquest mètode implica tenir un servidor HTTP que expose una API a la que se li poden enviar preguntes. Per crear aquesta API es pot utilitzar VLLM o Ollama, entre altres. Ollama és especialment útil i sencill, així que continuarem en ell en aquest manual.

```bash
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
```

Per desplegar `Ollama` és molt fàcil crear un `Docker Compose`. El podem unir al de Odoo o tenir en un servidor independent:

```yml
services:
  ollama:
    volumes:
      - ./ollama/ollama:/root/.ollama
    container_name: ollama
    pull_policy: always
    tty: true
    restart: unless-stopped
    image: docker.io/ollama/ollama:latest
    ports:
      - 7869:11434
    environment:
      - OLLAMA_KEEP_ALIVE=24h
    networks:
      - ollama-docker
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]

networks:
  ollama-docker:
    external: false
```

> Conforme el Docker Compose es va fen gran, desplegar tot junt costarà més i el servidor estarà més saturat. És molt perillós `Ollama` depenent del hardware i el model, així que ens podem preguntar si és possible dedicar un servidor independent per la IA.

Per a que funcione Docker amb GPU Nvidia es necessita configurar:

```bash
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg \
  && curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
    sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
    sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
sudo apt-get update
sudo apt-get install -y nvidia-container-toolkit

# Configure NVIDIA Container Toolkit
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker

# Test GPU integration
docker run --gpus all nvidia/cuda:11.5.2-base-ubuntu20.04 nvidia-smi
```

> Es recomana seguir documentació actualizada per instal·lar correctament l'última versión de Cuda i el toolkit.

Ollama permet desplegar models sols amb un comandament dins del contenidor:

```bash
ollama pull qwen2.5:0.5b
ollama run qwen2.5:0.5b
```

El model anterior és molt menut. Si comptem amb GPU de un 10GB de VRAM podem desplegar en un 7B o 8B, per exemple. En qualsevol cas es recomana que la versió del model siga de les últimes independentment de la mida i desplegar la més gran que puga la GPU.

Si volem una interfície web per a Ollama podem afegir-la al Docker Compose:

```yml
ollama-webui:
  image: ghcr.io/open-webui/open-webui:main
  container_name: ollama-webui
  volumes:
    - ./ollama/ollama-webui:/app/backend/data
  depends_on:
    - ollama
  ports:
    - 8080:8080
  environment: # https://docs.openwebui.com/getting-started/env-configuration#default_models
    - OLLAMA_BASE_URLS=http://host.docker.internal:7869 #comma separated ollama hosts
    - ENV=dev
    - WEBUI_AUTH=False
    - WEBUI_NAME=valiantlynx AI
    - WEBUI_URL=http://localhost:8080
    - WEBUI_SECRET_KEY=t0p-s3cr3t
    - NO_PROXY=host.docker.internal
  extra_hosts:
    - host.docker.internal:host-gateway
  restart: unless-stopped
  networks:
    - ollama-docker
```

Una vegada està en marxa, per peticions a la API és construir un JSON en el format adequat i enviar a l'endpoint. En aquest cas s'utilitza la biblioteca `ollama` de python per simplificar la petició:

```python
import ollama
response = ollama.chat(
    model="qwen2.5:0.5b",
    messages=[
    {"role": "system", "content": "You are a helpful assistant"},
    {"role": "user", "content": "Write a Python function for binary search"}
    ],
    options={
    "temperature": 0.3
    }
)
print(response["message"]["content"])
```
https://github.com/ollama/ollama-python 


A més baix nivell, es pot construir la mateixa petició en CURL:

```bash
curl http://localhost:11434/api/chat -d '{
  "model": "gemma3",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant"},
    {"role": "user", "content": "Write a Python function for binary search"}
  ],
  "options"={"temperature": 0.3}
}'
```


Si volem que Odoo envie la petició podem utilitzar llibreries estàndard de python:

```python
import requests
from odoo import models, fields, api

class AiService(models.Model):
    _name = "ai.service"

    def call_api(self):
        url = " http://ollama:11434/api/chat"
        payload = {
            "model": "gemma3",
            "messages": [
                {"role": "system", "content": "You are a helpful assistant"},
                {"role": "user", "content": "Write a Python function for binary search"}
            ],
            "options"={"temperature": 0.3}
            }

        response = requests.post(url, json=payload)
        data = response.json()

        return data
```

O amb la biblioteca d'Ollama:

```python
import ollama
from odoo import models, fields, api

client = Client(host='http://ollama:11434')

class AiService(models.Model):
    _name = "ai.service"

    def call_api(self):

        response = client.chat(
            model="qwen2.5:0.5b",
            messages=[
            {"role": "system", "content": "You are a helpful assistant"},
            {"role": "user", "content": "Write a Python function for binary search"}
            ],
            options={
            "temperature": 0.3
            }
        )

        response = requests.post(url, json=payload)
        data = response.json()

        return data
```

En tots els exemples anteriors es fa en mode `chat`. Això accepta format xat i necessita un array de messages. Si volem una única resposta es pot fer una petició `generate`:

```python
      payload = {
            "model": "gemma3",
            "prompt": "Write a Python function for binary search",
            }

```

## Exposar un Model

Odoo pot executar models d’intel·ligència artificial perquè funciona sobre Python, així que és possible utilitzar llibreries com _transformers_, _torch_ o altres dins d’un mòdul i exposar el resultat mitjançant una API amb els controladors HTTP d’Odoo. No sol ser l’arquitectura més recomanada quan els models són grans o consumeixen molts recursos, ja que pot afectar el rendiment de l’ERP. Per això, en projectes professionals es separa la IA en un servei extern i Odoo només fa les crides a aquesta API. Aquesta integració directa dins d’Odoo té més sentit quan es tracta de models menuts o tasques lleugeres com classificació de textos, recomanacions o càlcul d’embeddings.

### Exposar l'API per Web Controllers

És posible que pugam exposar l'API de forma externa. En aquest cas Odoo fa d'intermediari

### MCP
