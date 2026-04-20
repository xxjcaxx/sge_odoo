
### Pràctica: El meu primer mòdul ("Hola Món") en Odoo 19

**Objectiu:** Crear un mòdul complet des de zero que incloga un model amb una representació de tots els tipus de dades bàsics, configurant correctament la interfície d'usuari i els permisos d'accés per a permetre una auditoria externa via JSON-2.

#### 1. Creació de l'estructura del mòdul
Utilitza el comandament **scaffold** per a generar l'estructura base del teu mòdul amb el nom que vulgues. 

#### 2. Definició del Model i els Camps (Fields)
Dins del fitxer `models/models.py`, crea una classe que herete de `models.Model`. Has d'incloure **exactament un camp de cada tipus següent** (excloent els relacionals):

*   **Tipus bàsics:** `Integer`, `Char`, `Text`, `Float`, `Boolean`, `Date`, `Datetime`, `Html`.
*   **Camps de fitxers:**
    *   `Binary`: Per a dades generals.
    *   `Image`: Configurat amb els atributs `max_width` i `max_height` (per exemple, 512px) per a reescalar automàticament.
*   **Camp de selecció:**
    *   `Selection`: Ha de tindre exactament **3 opcions** definides en una llista de tuples.

**Requisits addicionals dels camps:**
*   Almenys dos camps han de ser **obligatoris** (`required=True`).
*   Almenys dos camps han de tindre un **valor per defecte** (`default`).

#### 3. Menús, Accions i Seguretat
Per a que el mòdul siga funcional en el client web, cal configurar:
*   **Acció de finestra:** Defineix una `ir.actions.act_window` per al teu model.
*   **Menús:** Crea un menú principal i un submenú que execute l'acció anterior mitjançant l'etiqueta `<menuitem>`.
*   **Permisos:** Configura el fitxer `security/ir.model.access.csv` per a donar permisos de lectura i escriptura al grup `base.group_user` o a l'administrador, per tal d'evitar errors d'accés.

#### 4. Instal·lació i Preparació per a l'Avaluació
1.  Instal·la el mòdul en la teua instància d'Odoo.
2.  Crea almenys un registre de prova amb dades en tots els camps.
3.  **Genera una API Key:** Ves a la configuració del teu usuari (pestanya de seguretat) i genera una clau per a l'API externa.
4.  **Publicació:** Entrega a la web del professor l'adreça IP del teu servidor, el **nom tècnic del mòdul** i el **nom del model**

---

### Sistema d'Avaluació Automàtica (JSON-2)
La web del professor es connectarà a la teua instància utilitzant l'API **JSON-2** (ruta `/json/2/<model>/<method>`) de l'Odoo 19. El sistema realitzarà les següents verificacions automàtiques:

1.  **Descobriment de Metadades:** Executarà el mètode `fields_get` per a obtindre la definició de tots els camps del teu model.
2.  **Validació de Tipus:** Comprovarà que existisquen els tipus `integer`, `char`, `text`, `float`, `boolean`, `date`, `datetime`, `html`, `binary`, `image` i `selection`.
3.  **Validació de Restriccions:**
    *   Verificarà que el camp `selection` tinga 3 opcions.
    *   Verificarà quins camps tenen la propietat `required`.
4.  **Comprovació de dades:** Realitzarà un `search_read` per a confirmar que el registre de prova s'ha creat correctament.

