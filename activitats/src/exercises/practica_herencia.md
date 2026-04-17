
### Pràctica: Sistema d'Herència per a Comandes de Restauració

**Objectiu:** Estendre la funcionalitat base d'una comanda per a gestionar diferents tipus de lliurament i categories de clients, utilitzant herència de classe, prototip i delegació, així com la personalització avançada d'accions i vistes.

#### 1. Models i Herència de Model
Heu de crear un mòdul anomenat `restaurant_comandes` amb els següents models i relacions:

*   **Model Base (`restaurant.comanda`):** Conté fields com `name` (referència), `data_comanda` (Datetime) i `estat` (Selection: esborrany, enviat, lliurat).
*   **Herència de Classe (Extension):** Estén el model `restaurant.comanda` per a afegir el camp `instruccions_lliurament` (Text).
    *   *Requisit:* Utilitza `_inherit = 'restaurant.comanda'` sense canviar el `_name`.
*   **Herència per Prototip:** Crea un model nou anomenat `comanda.urgent` que aprofite la definició de la comanda base però en una taula diferent.
    *   *Requisit:* Utilitza `_inherit = 'restaurant.comanda'` i `_name = 'comanda.urgent'`. Afegeix el camp `recàrrec_urgència` (Float).
*   **Herència per Delegació:** Crea un model anomenat `comanda.especial` que delegue en `restaurant.comanda`.
    *   *Requisit:* Utilitza `_inherits = {'restaurant.comanda': 'comanda_id'}`. Afegeix el camp `regal_promocional` (Char).

#### 2. Herència i Personalització de Vistes
*   **Herència de Vista:** Modifica la vista formulari original de `restaurant.comanda` per a inserir el camp `instruccions_lliurament` després de la data.
    *   *Tècnica:* Utilitza una expressió **`xpath`** amb `position="after"`.
*   **Vistes Específiques sense Herència:** Per al model `comanda.urgent`, no heretes la vista; defineix una vista de llista totalment nova on les files es mostren en color roig si el recàrrec és elevat (usa `decoration-danger`).
*   **Acció amb `view_ids`:** En l'acció de finestra de `comanda.urgent`, especifica exactament quina vista de llista i formulari vols mostrar usant el camp `view_ids` per a evitar que Odoo trie les de la comanda base per prioritat.

#### 3. Configuració de l'Acció (Actions)
Heu de configurar l'acció de finestra per a les comandes urgents amb els següents paràmetres:
*   **Domain:** L'acció sols ha de mostrar comandes on l'estat siga diferent de 'lliurat'.
*   **Context (Default):** En crear una comanda des d'aquesta acció, el camp `estat` ha de ser per defecte.
*   **Filtre per defecte:** A la vista de cerca (search), crea un filtre per a comandes del dia d'avui i activa'l per defecte en l'acció.

#### 4. Herència en el Controlador (Mètodes ORM)
Dins del model `comanda.urgent`, sobreescriu el mètode **`create()`**.
*   **Lògica:** Quan es cree una comanda urgent, el sistema ha d'afegir automàticament el prefix "URGENT/" al nom de la comanda abans de cridar al `super()`.

#### 5. Avaluació Remota
Per a que el professor puga avaluar la pràctica de forma automàtica via **JSON-2**, heu de crear un model addicional d'avaluació:

*   **Model `restaurant.avaluador`:**
    *   `nom_model` (Char): Nom del model que heu creat (ex: `comanda.urgent`).
    *   `model_heretat` (Char): Nom del model del qual hereta (ex: `restaurant.comanda`).
    *   `tipus_herencia` (Selection): Opcions: 'classe', 'prototip', 'delegacio'.

**Comprovació de la web de validació:**
1.  Es connectarà via API i llegirà els registres de `restaurant.avaluador`.
2.  Per a cada registre, inspeccionarà el model indicat usant l'ORM per a verificar si l'atribut `_inherit` o `_inherits` coincideix amb el tipus d'herència declarat.
3.  Intentarà crear una comanda urgent per a verificar si el controlador ha afegit el prefix correctament.
4.  Consultarà l'acció de finestra per a validar el `domain` i el `search_default`.

**Requisits d'entrega:**
*   Pujar el mòdul al repositori Git.
*   Proporcionar l'adreça IP del VPS on corre Odoo en Docker i una **API Key** vàlida.