
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
*   **Colors de decoració:** En funció de camps numèrics (ex: vida baixa) o estats.
*   **Llista Editable:** Un dels models (ex: `rpg.classe`) ha de permetre l'edició directa des de la llista.
*   **Ordenació per defecte:** Una llista s'ha d'ordenar automàticament per un field (ex: nivell del personatge).
*   **Agrupació per defecte:** Una llista ha d'aparèixer agrupada per un field (ex: agrupar personatges per classe).

#### 3. Requisits de les Vistes `form` (Formulari)
Tots els formularis han d'estar estructurats amb les etiquetes vistes a classe. 
*   **Organització:** Almenys un model (ex: `rpg.personatge`) ha de mostrar pestanyes (ex: Dades, Habilitats, Historial).
*   **Relacions i Valors:**
    *   **One2many amb valor per defecte:** En crear una nova habilitat des del personatge, el camp de relació ha d'agafar automàticament l'ID del pare.
    *   **Many2one amb Domain:** Filtra un camp (ex: en triar una missió, que sols apareguen les que estan en estat 'activa')
*   **Widgets Específics:** Heu d'implementar els següents ginys:
    *   `widget="image"`: Per a la foto del personatge.
    *   `widget="progressbar"`: Per a mostrar el progrés d'una missió o l'experiència.
    *   `widget="ribbon"`: Una cinta per a indicar si un personatge és 'Llegendari' (Boolean).
    *   `widget="many2many_tags"`: Per a mostrar les habilitats de forma compacta.
*   **Subvistes Embedides:** Un camp Many2many dins d'un formulari ha de tindre definida una vista `<list>` personalitzada directament dins del camp XML.
*   **Header i Estats:** Inclou un `<header>` que continga el camp `state` per a gestionar el flux de vida del personatge o missió.
*   **Dinamisme Condicional:**
    *   **Camp Ocult:** Un field ha de ser `invisible` si no es compleix una condició (ex: camp 'mana' ocult si la classe no és 'Mag').
    *   **Camp Read-only:** Un field ha de ser de sols lectura segons una condició (ex: el nom del personatge no es pot canviar si l'estat és 'Bloquejat').
