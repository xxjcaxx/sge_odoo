
### Pràctica: Sistema de Gestió de Joc de Rol (RPG)

**Objectiu:** Crear un mòdul que gestione personatges, classes, missions i habilitats, aplicant configuracions avançades de vistes per a optimitzar l'experiència d'usuari.

#### 1. Models Suggerits
Heu de definir, com a mínim, els següents models:
*   `rpg.personatge`: El model principal de l'heroi.
*   `rpg.classe`: (ex: Guerrer, Mag, Lladre).
*   `rpg.missio`: Missions que poden realitzar.
*   `rpg.habilitat`: Habilitats especials.

#### 2. Requisits de les Vistes `list` (Llista)
Tots els models han de tindre la seua pròpia vista de llista. Cal aplicar les següents configuracions repartides entre els models:
*   **Colors de decoració:** Utilitza atributs com `decoration-danger` o `decoration-success` en funció de camps numèrics (ex: vida baixa) o estats.
*   **Llista Editable:** Un dels models (ex: `rpg.classe`) ha de permetre l'edició directa des de la llista usant `editable="top"`.
*   **Ordenació per defecte:** Una llista s'ha d'ordenar automàticament per un field (ex: nivell del personatge) usant `default_order`.
*   **Agrupació per defecte:** Una llista ha d'aparèixer agrupada per un field (ex: agrupar personatges per classe) usant `default_group_by`.

#### 3. Requisits de les Vistes `form` (Formulari)
Tots els formularis han d'estar estructurats amb l'etiqueta `<sheet>` i organitzats en `<group>` per a una visualització neta.
*   **Organització:** Almenys un model (ex: `rpg.personatge`) ha d'utilitzar un `<notebook>` amb diverses `<page>` (ex: Dades, Habilitats, Historial).
*   **Relacions i Valors:**
    *   **One2many amb valor per defecte:** En crear una nova habilitat des del personatge, el camp de relació ha d'agafar automàticament l'ID del pare mitjançant el `context`.
    *   **Many2one amb Domain:** Filtra un camp (ex: en triar una missió, que sols apareguen les que estan en estat 'activa') usant l'atribut `domain`.
*   **Widgets Específics:** Heu d'implementar els següents ginys:
    *   `widget="image"`: Per a la foto del personatge.
    *   `widget="progressbar"`: Per a mostrar el progrés d'una missió o l'experiència.
    *   `widget="ribbon"`: Una cinta per a indicar si un personatge és 'Llegendari' (Boolean).
    *   `widget="many2many_tags"`: Per a mostrar les habilitats de forma compacta.
*   **Subvistes Embedides:** Un camp Many2many dins d'un formulari ha de tindre definida una vista `<list>` personalitzada directament dins del camp XML (no referenciada).
*   **Header i Estats:** Inclou un `<header>` que continga el camp `state` per a gestionar el flux de vida del personatge o missió.
*   **Dinamisme Condicional:**
    *   **Camp Ocult:** Un field ha de ser `invisible` si no es compleix una condició (ex: camp 'mana' ocult si la classe no és 'Mag').
    *   **Camp Read-only:** Un field ha de ser de sols lectura (`readonly`) segons una condició (ex: el nom del personatge no es pot canviar si l'estat és 'Bloquejat').

#### 4. Accions i Menús
*   Crea les **accions de finestra** (`ir.actions.act_window`) per a cada model, definint el `view_mode` correcte.
*   Organitza els **menús** en almenys dos nivells: un menú principal "RPG" i submenús per a cada entitat.

---

### Sistema d'Avaluació Automàtica (JSON-2)
La web externa de validació realitzarà tres tipus de comprovaions mitjançant l'API externa:

1.  **Inspecció de Metadades :** Es cridarà al mètode `fields_get()` per a verificar que els atributs `required`, `readonly` i els noms tècnics dels camps coincideixen amb el requerit.
2.  **Validació d'Arquitectura XML :** Es consultarà el model `ir.ui.view` per a analitzar el camp `arch`. El sistema buscarà les cadenes exactes de `widget="..."`, l'existència de `<notebook>`, `<sheet>`, i les condicions de `invisible` o `readonly` dins del XML.
3.  **Comprovació d'Accions i Context :** S'inspeccionarà el model `ir.actions.act_window` per a verificar que els `domains` i els valors per defecte enviats pel `context` (com el de la relació One2many) estan correctament definits a la base de dades.

**Entrega:** L'alumne ha de proporcionar la IP del servidor, la base de dades i una **API Key** vàlida generada des del seu perfil d'usuari en Odoo 19.
