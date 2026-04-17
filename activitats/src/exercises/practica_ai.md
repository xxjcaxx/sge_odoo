
### Pràctica: RPG AI Master amb Odoo 19 i Ollama

**Objectiu:** Desenvolupar un mòdul anomenat `rpg_ai_master` que permeta la interacció amb personatges, la generació d'escenaris dinàmics i la gestió automatitzada de la base de dades mitjançant models de llenguatge (LLM).

#### 1. Requisits de l'entorn
*   **Odoo 19** funcionant en **Docker Compose**.
*   **Ollama** instal·lat en remot a l'IES.

#### 2. Tasca 1: Xat amb Personatges (Personalitat)
L'alumne ha de crear un **Wizard** (basat en `TransientModel`) per a simular un xat.
*   **Funcionament:** Des de la vista formulari d'un personatge (`rpg.personatge`), un botó de tipus `action` obrirà el xat.
*   **Lògica:** El mètode del xat ha d'obtenir l'`active_id` del personatge. Amb l'ORM, llegirà la seua "fitxa" (nom, classe, descripció). 
*   **Prompt:** S'enviarà a Ollama un *system prompt* on es diga: "Ets [NOM]. La teua personalitat és: [DESCRIPCIÓ]". La resposta es mostrarà en un camp de text de sols lectura al Wizard.

#### 3. Tasca 2: Generador d'Escenaris i Game Master
Es crearà un segon **Wizard** que actue com a assistent d'escenaris.
*   **Selecció:** Un camp **Many2many** permetrà triar diversos personatges de la base de dades.
*   **Generació:** Un botó enviarà les dades de tots els personatges triats a Ollama per a crear una situació inicial.
*   **Interacció:** El Wizard tindrà un camp `state` (com un assistent) per a gestionar el torn del jugador.
*   **Daus:** Es crearà un mètode Python que genere números aleatoris (daus) i s'enviarà el resultat al LLM perquè narre la conseqüència de l'acció segons el dau.

#### 4. Tasca 3: Generador de Personatges Multimodal
Aquest apartat se centra en la creació de registres a partir de dades estructurades JSON generades per la IA.
*   **Procés:** L'usuari descriu un personatge i Ollama ha de retornar un **JSON** amb l'estructura de camps d'Odoo (nom, vida, força...).
*   **Creació:** El mètode d'Odoo rebrà el JSON, el parsejarà i utilitzarà la funció **`create()`** de l'ORM per a guardar-lo.
*   **Imatge:** Al ser un model multimodal, si la IA genera una imatge o una descripció visual, es guardarà en un camp de tipus **`Image`** (en base64) amb `max_width` i `max_height` configurats.


### 5. Tasca 4: Sistema MCP (Model Context Protocol) amb Ollama

En aquesta tasca, configurareu Odoo 19 perquè funcione com un **host d'execució MCP**. En lloc de fer consultes passives, el model de llenguatge (**Ollama**) podrà decidir quines accions realitzar sobre la base de dades i Odoo les executarà en temps real.

**Objectiu:** Implementar un cicle de retroalimentació on el LLM utilitze "eines" per a interactuar amb l'ORM d'Odoo.

#### 1. Flux d'execució MCP
L'alumne ha d'implementar el següent flux de comunicació:
1.  **Peticio de l'usuari:** El jugador envia un missatge a través del xat (per exemple: *"M'ha colpejat un orc, resta'm 10 punts de vida"*).
2.  **Cridada a Ollama:** Odoo envia el prompt juntament amb una definició de les "eines" disponibles (mètodes com `consulta_stats` o `modifica_atributs`).
3.  **Tool Call (Ollama):** El model de llenguatge, seguint l'estàndard MCP, no respon amb text, sinó amb un **JSON de cridada a funció** que especifica el mètode i els arguments (per exemple: `method: 'write'`, `args: {'vida': 40}`).
4.  **Execució en Odoo:** El servidor rep la instrucció, valida que l'usuari té permisos i executa el mètode corresponent mitjançant l'**ORM** (com `write()` per a actualitzar o `search()` per a consultar).
5.  **Retorn de resultats:** Odoo envia el resultat de l'operació (per exemple: *"Vida actualitzada correctament"*) de tornada a Ollama.
6.  **Resposta final:** El LLM genera el text final per al jugador basant-se en la confirmació real de la base de dades.

#### 2. Implementació Tècnica
*   **Controlador d'execució:** Heu d'utilitzar l'estructura de l'**API externa JSON-2** d'Odoo 19 per a rebre les peticions de tornada d'Ollama a la ruta `/json/2/<model>/<method>`.
*   **Seguretat i API Keys:** Totes les cridades han d'anar autenticades amb un **Bearer token (API Key)** generat prèviament per a garantir que sols la IA pot modificar les estadístiques de forma automatitzada.
*   **Accions de Servidor:** Podeu configurar **Server Actions** de tipus "codi Python" per a definir lògiques complexes que el LLM puga invocar amb una sola instrucció.

