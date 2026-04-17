### Pràctica: Cartes de Personatge RPG (Estètica Magic)

**Objectiu:** Implementar dues visualitzacions Kanban (una externa i una encastada en un formulari) utilitzant HTML, CSS i QWeb per a simular el disseny de cartes col·leccionables.

#### 1. Definició del Model (`rpg.personatge`)
Crea un model amb els següents camps bàsics per a la carta:
*   `name` (Char): Nom del personatge.
*   `image` (Image): Imatge de l'heroi (reescalada a 512x512).
*   `classe` (Selection): Tipus de personatge (Guerrer, Mag, etc.).
*   `nivell` (Integer): Nivell de poder.
*   `descripcio` (Text): Habilitats o "lore" del personatge.
*   `color` (Integer): Per a gestionar el color de la carta.

#### 2. Kanban Extern (Vista Principal)
Crea una vista Kanban que es mostre en polsar el menú principal del joc.
*   **Estructura QWeb:** Dins de `<t t-name="kanban-box">`, dissenya un `div` principal amb una classe CSS personalitzada (ex: `.mtg-card`).
*   **Elements de la carta:**
    *   **Capçalera:** Nom i nivell a la part superior.
    *   **Imatge:** Utilitza la funció `kanban_image()` per a mostrar la foto al centre de la carta.
    *   **Cos:** Un requadre inferior amb el text de la `descripcio`.
*   **Funcionalitat:** Fes que en polsar la carta s'òbriga el formulari d'edició (`type="edit"`).

#### 3. Kanban Intern (Dins del Formulari de Gremi)
Crea un segon model `rpg.gremi` (Guild) que tinga una relació **Many2many** o **One2many** amb els personatges.
*   **Tasca:** En la vista `form` del gremi, mostra els membres utilitzant el widget Kanban.


#### 4. Estètica i CSS (Assets)
Per a aconseguir l'estètica de "carta Magic", l'alumne ha de crear un fitxer CSS en `static/src/css/rpg_styles.css` i registrar-lo al manifest dins del bundle `web.assets_backend`.
*   **Requisits de disseny:**
    *   **Bordes arrodonits** i ombres (`box-shadow`) per a la carta.
    *   **Fons amb degradats** o textures segons la classe del personatge (ex: roig per a guerrers, blau per a mags).
    *   **Tipografia:** Usa una font estilitzada per al nom.

#### 5. Accions i Menús
Configura l'acció de finestra perquè la vista per defecte siga el Kanban:

---

### Avaluació
Per a superar la pràctica, l'alumne haurà de lliurar una **captura de pantalla completa del navegador** on es veja:
1.  L'URL del seu Odoo (pot ser local o VPS).
2.  La **vista Kanban principal** amb almenys 4 personatges creats.
3.  L'evidència visual de l'estètica sol·licitada (imatges centrades, bordes de carta, colors diferenciats i descripcions visibles).
4.  Una segona captura del **formulari d'un Gremi** on apareguen les cartes encastades correctament.

**Nota tècnica:** Recorda activar el mode desenvolupador (`?debug=1`) per a forçar la càrrega dels assets CSS si no apareixen immediatament.