
### Pràctica: Sistema de Gestió de Lliga de Bàsquet

**Objectiu:** Crear un mòdul d'Odoo per a gestionar una lliga de bàsquet, implementant relacions complexes entre equips, jugadors i estadis, incloent filtres dinàmics i camps relacionats.

#### 1. Models i Estructura de Dades
Heu de crear els següents models amb els noms tècnics exactes:

**A. Model `basquet.equip` (L'Equip)**
*   `name` (Char): Nom de l'equip.
*   `ciutat`(Char)
*   `jugador_ids` (**One2many**): Relació amb els jugadors de l'equip.
*   `estadi_id` (**Many2one**): Estadi principal on juga l'equip.
*   **Dues relacions Many2many entre els mateixos models:**
    *   `equips_agermanats_ids` (**Many2many**): Equips amb els que tenen bona relació.
    *   `equips_rivals_ids` (**Many2many**): Equips rivals històrics.
    *   *Nota:* Al haver-hi dues relacions M2M entre els mateixos models (`equip` amb `equip`), heu d'especificar obligatòriament el nom de la taula intermèdia en cadascun per evitar conflictes.

**B. Model `basquet.jugador` (El Jugador)**
*   `name` (Char): Nom del jugador.
*   `equip_id` (**Many2one**): Equip al qual pertany el jugador.
*   `estadi_nom` (**Related**): El nom de l'estadi de l'equip on juga el jugador (a través de `equip_id.estadi_id.name`).
*   `es_capita` (Boolean): Indica si el jugador és el capità.

**C. Model `basquet.pavello` (L'Estadi)**
*   `name` (Char): Nom del pavelló.
*   `ciutat` (Char): Ciutat on es troba.

#### 2. Implementació de Domains (Filtres)
Heu d'aplicar els següents **domains** en el codi Python per a restringir les opcions de l'usuari:
1.  En el camp `equip_id` del jugador: Sols s'han de poder triar equips que tinguen un estadi assignat.
2.  En el camp `estadi_id` de l'equip: Sols s'han de poder triar estadis d'una ciutat concreta (per exemple, 'València').

#### 3. Requisits tècnics per a la validació
Per a que la web del professor puga validar la pràctica mitjançant **JSON-2**, cal assegurar els següents punts:

*   **API Key:** Genera una API Key per a l'usuari administrador des de la configuració de seguretat.
*   **Ruta JSON-2:** La web farà peticions POST a `http://la_teua_ip:8069/json/2/basquet.jugador/search_read` per comprovar si el camp `estadi_nom` (Related) retorna el valor correcte de l'estadi de l'equip.
*   **Permisos:** El fitxer `ir.model.access.csv` ha de permetre l'accés de lectura i escriptura a tots els models nous per al grup d'usuaris base.

#### 4. Prova de Funcionament
L'avaluació automàtica comprovarà:
1.  **Tipus de Fields:** Que `jugador_ids` siga realment un One2many i `equips_rivals_ids` un Many2many.
2.  **Creació i Visibilitat:** El sistema crearà un equip i un jugador via API i verificarà que, en consultar el jugador, el camp **Related** (`estadi_nom`) s'ha emplenat automàticament amb la dada de l'estadi de l'equip vinculat.
3.  **Taules M2M:** Verificarà que les dues relacions Many2many funcionen de forma independent a la base de dades PostgreSQL.

**Entrega:** Publica el nom del teu mòdul a la web del professor per a iniciar el test de connexió via JSON-2. També la url al mòdul al teu github. 