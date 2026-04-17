
### Pràctica: API REST del Motor de Joc de Rol

**Objectiu:** Desenvolupar un controlador web que implemente els quatre verbs principals d'HTTP (GET, POST, PUT, DELETE) per a interactuar amb un model de personatges, gestionant l'estat del joc de forma externa.

#### 1. Requisits del Controlador (`controllers/main.py`)
Per a que la web del professor puga avaluar la pràctica directament amb la vostra IP, tots els alumnes han d'utilitzar l'endpoint: **`/rpg/api`**.

*   **Configuració de Seguretat:**
    *   Cal desactivar la protecció **CSRF** (`csrf=False`) per a permetre peticions externes de tipus POST/PUT/DELETE.
    *   Cal permetre **CORS** (`cors="*"`) per a que el navegador de la web del professor no bloquege la petició `fetch`.
    *   S'ha implementar autenticació i es proporcionarà usuari i password.

#### 2. Implementació dels Verbs (Endpoints)
Heu de crear una única ruta `/rpg/api` que gestione els diferents mètodes segons el verb HTTP rebut:

*   **GET (Informació):**
    *   Si rep la capçalera `Accept: application/json`, ha de retornar un JSON amb la llista de personatges i la seua vida/nivell.
    *   Si es demana de forma normal des del navegador, ha de retornar un **HTML** (usant `request.render`) que mostre l'estat visual del joc.
*   **POST (Acció/Creació):** S'utilitza per a "atacar" o realitzar una acció específica. Ha de rebre un JSON amb el personatge objectiu i actualitzar el seu estat a la base de dades.
*   **PUT (Actualització):** S'utilitza per a curar un personatge o pujar-lo de nivell, modificant els camps del model de forma persistent.
*   **DELETE (Reset):** S'utilitza per a eliminar un personatge derrotat o reiniciar la partida.


#### 4. Vista HTML (Template QWeb)
Heu de definir una plantilla en XML per a la resposta visual del mètode GET. Aquesta ha de mostrar el logotip del joc i una llista dels jugadors en format HTML.

#### 5. Avaluació Automàtica
La web del professor realitzarà peticions `fetch` de la següent manera:
1.  **`GET`**: Comprovarà que la resposta és un JSON amb dades reals dels models.
2.  **`POST`**: Enviara una acció i verificarà si el camp `vida` del personatge ha disminuït en Odoo.
3.  **`PUT`**: Intentarà modificar el nom o nivell d'un personatge.
4.  **`HTML`**: Comprovarà que la ruta en format text retorna el codi HTML generat pel servidor.

**Nota d'entrega:** Sols cal facilitar la **IP** del vostre servidor, usuari i contrasenya. Com que els endpoints i mètodes estan estandarditzats, el sistema de proves podrà iterar sobre la vostra aplicació automàticament.