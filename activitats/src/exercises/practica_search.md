
### Pràctica: Cercador Avançat de Personatges RPG

**Objectiu:** Crear una vista de cerca completa per al model `rpg.personatge` que incloga camps de cerca simples, lògica de dominis, filtres predefinits i agrupacions, configurant també un filtre actiu per defecte des de l'acció,.

#### 1. Estructura de la Vista Search
Heu de definir la vista en un fitxer XML (per exemple, `views/rpg_views.xml`). Per a l'avaluació, és imprescindible que el record tinga un **`id` (External ID)** clar.

**Requisits de la vista:**
*   **Camps Simples:** Permetre la cerca pel camp `name`.
*   **Camps amb Domain:** El camp `nivell` ha de permetre cercar personatges que tinguen un nivell igual o superior al valor introduït per l'usuari (`self`).
*   **Filtres de Domini (`filter`):**
    *   Un filtre anomenat **`filtre_actiu`** que mostre sols els personatges on el camp `actiu` siga `True`.
    *   Un filtre anomenat **`herois_nics`** per a personatges de nivell baix (per exemple, menor a 5),.
*   **Agrupacions (`group`):** Un menú desplegable que permeta agrupar els resultats pel camp **`classe`** (Guerrer, Mag, etc.).

#### 2. Configuració de l'Acció (Filtre per Defecte)
Per a que la vista de llista s'òbriga mostrant només els personatges actius, heu de configurar el camp `context` de la vostra **`ir.actions.act_window`**.

#### 3. Avaluació Automàtica
Per a validar la pràctica, haureu d'introduir a la web del professor les següents dades:
1.  **Nom del mòdul:** (Ex: `rpg_base`).
2.  **Model:** `rpg.personatge`.
3.  **External ID de la vista:** `nom_del_modul.view_search_rpg_personatge`.

**Funcionament de la web de validació:**
La web utilitzarà l'API **JSON-2** per a:
*   **Consultar la vista:** Accedirà al model `ir.ui.view` per a llegir el camp `arch` i verificar que existeixen els filtres i grups amb els noms exactes requerits.
*   **Executar la cerca:** Realitzarà una petició `search_read` enviant el context del filtre per defecte per a comprovar que el servidor d'Odoo retorna els registres filtrats correctament.
*   **Verificació de dominis:** Comprovarà que el domini del camp `nivell` utilitza l'operador `>=` tal com s'ha especificat,.

Recordeu tindre el VPS actiu, el port **8069** accessible i una **API Key** vàlida per a que la web puga realitzar les consultes,.