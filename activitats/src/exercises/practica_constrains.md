### Pràctica: Sistema de Matriculació d'Alumnes

**Objectiu:** Crear un mòdul anomenat `matricula_estudis` que gestione la inscripció d'alumnes en cursos, assegurant que se segueixen regles de negoci estrictes sobre edats, dates i capacitats.

#### 1. Models Requerits
Heu de crear els següents models amb els noms tècnics exactes:
*   `matricula.curs`: Representa l'oferta formativa.
*   `matricula.alumne`: Representa l'estudiant.
*   `matricula.inscripcio`: Relaciona un alumne amb un curs (model principal).

#### 2. Restriccions Simples (SQL Constraints)
Implementeu restriccions a nivell de base de dades utilitzant l'atribut `_sql_constraints`:
*   **Unicitat:** El camp `nif` del model `matricula.alumne` ha de ser únic.
*   **Rang Numèric:** L'edat de l'alumne ha de ser un número positiu.
*   **Capacitat:** La `capacitat_maxima` del curs ha de ser superior a zero.

#### 3. Restriccions Complexes (Python Constraints)
Utilitzeu el decorador `@api.constrains()` per a lògiques que impliquen diversos models o dates:
*   **Dates Coherents:** A `matricula.curs`, la `data_fi` no pot ser anterior a la `data_inici`.
*   **Validació de Matriculació:** Al model `matricula.inscripcio`, la `data_inscripcio` ha d'estar compresa entre la data d'inici i de fi del curs seleccionat.
*   **Requisit d'Edat:** L'alumne ha de tenir una edat igual o superior a l'edat mínima definida al curs.
*   **Control de Plaçes:** No es pot crear una inscripció si el curs ja ha arribat a la seua `capacitat_maxima`.

*Nota: Recordeu llançar una excepció `ValidationError` quan no es complisquen aquestes condicions.*

#### 4. Forçat de Domini mitjançant Camp Computat
Per millorar l'experiència d'usuari i evitar errors abans de guardar, implementareu un "filtre dinàmic":
1.  Al model `matricula.inscripcio`, creeu un camp **Many2many computat** (`store=False`) anomenat `alumne_elegible_ids` cap al model `matricula.alumne`.
2.  La funció `@api.depends` d'aquest camp ha de buscar i retornar tots els alumnes que compleixen l'edat mínima del curs seleccionat i que **no** estan ja matriculats en ell.
3.  Al camp **Many2one** `alumne_id`, apliqueu un **domain** al XML que utilitze aquest camp computat.

#### 5. Avaluació Automàtica
El professor utilitzarà una web que es connectarà al vostre VPS mitjançant l'API **JSON-2** (`/json/2/matricula.inscripcio/create`). La web intentarà realitzar accions com aquestes:
*   Crear un alumne amb un NIF que ja existeix (ha de fallar per restricció SQL).
*   Matricular un alumne en un curs que ja està ple (ha de fallar per restricció Python).
*   Matricular un alumne amb una data d'inscripció fora del rang del curs (ha de fallar).
*   Consultar via `fields_get` si el camp `alumne_id` té aplicat el domini correcte sobre el camp computat.

**Requisits d'entrega:**
*   **Codi font:** Repositori Git amb el mòdul funcional.
*   **Instància activa:** Odoo 19 corrent en Docker amb el port 8069 obert i una **API Key** configurada per a l'avaluació.