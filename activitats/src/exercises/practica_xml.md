### Pràctica: Generació de Dades de Demostració per a RPG

**Objectiu:** Crear un mòdul que definisca un sistema de personatges de rol i utilitzar fitxers XML per a carregar dades complexes que incloguen imatges, relacions i càlculs dinàmics de dates.

#### 1. Models Inventats i Estructura
Heu de definir almenys els següents models en el vostre fitxer Python:
*   El personatge principal.
*   Característiques o habilitats del personatge.
*   **`rpg.avaluador`**: Model especial per a la verificació automàtica.

**Camps del model `rpg.avaluador` (Obligatori per al test):**
Aquest model és la clau per a que la web del professor puga trobar les vostres dades. Ha de tindre:
1.  **`nom_model`** (Char): El nom tècnic del model a testar (ex: el model dels herois).
2.  **`ext_id`** (Char): L'ID extern complet
3.  **`requisit`** (Selection): Camp igual per a tots els alumnes amb les opcions:
    *   `('img', 'Imatge')`
    *   `('ref', 'Referència')`
    *   `('dat', 'Data Calculada')`
    *   `('m2m', 'Relació Many2many')`.

#### 2. Requisits del Fitxer de Dades (`demo.xml`)
Dins de la carpeta `demo/` del vostre mòdul, creeu un fitxer XML que complisca els següents requisits per a cada personatge:

*   **External IDs:** Tots els registres han de tindre un `id` únic que permeta fer referència a ells des d'altres llocs.
*   **Imatges:** Heu d'incloure una imatge de l'heroi. Useu l'atribut `type="base64"` i `file="ruta/al/fitxer.png"` per a carregar-la des del sistema de fitxers del mòdul.
*   **Dates Calculades:** El camp de data de creació de l'heroi no pot ser una cadena fixa. Heu d'usar l'atribut `eval` amb una expressió de Python per a calcular-la (ex: la data actual menys 30 dies).
*   **Relacions Many2many (m2m):** Heu de vincular habilitats al personatge usant la tripleta **`(0, 0, {'camp': 'valor'})`**, la qual crea un nou registre d'habilitat i el vincula automàticament al personatge en el mateix fitxer de dades.
*   **Referències:** El personatge ha de tindre un camp Many2one que apunte a un altre model preexistent o creat en el mateix XML usant l'atribut `ref`.

#### 3. Registre de Control (Avaluació)
Al mateix XML de dades de demo, heu de crear quatre registres del model **`rpg.avaluador`**, un per a cada requisit de la pràctica.

#### 4. Avaluació Automàtica (JSON-2)
La web del professor demanarà el **nom del vostre mòdul** i el **nom del model d'avaluació** (`rpg.avaluador`). Mitjançant l'API **JSON-2** (peticions POST a `/json/2/rpg.avaluador/search_read`), la web farà el següent:
1.  Consultarà tots els registres del vostre model `rpg.avaluador`.
2.  Iterarà sobre cada `ext_id` proporcionat.
3.  Usarà la funció `ref()` o cerques per ID extern per a verificar que el registre existeix.
4.  Comprovarà si els camps contenen la dada adequada:
    *   Si la imatge té contingut en base64.
    *   Si la data calculada és correctament un objecte de data en el passat.
    *   Si la relació Many2many s'ha creat correctament amb les habilitats indicades.
