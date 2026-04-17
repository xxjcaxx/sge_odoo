
### Pràctica: Desplegament d'Odoo 19 i Validació Automatitzada via JSON-2

**Objectiu:** Configurar un servidor remot (VPS) per a executar Odoo 19 mitjançant Docker Compose, assegurant que l'usuari puga gestionar els contenidors sense privilegis de `sudo` i que el sistema siga accessible per a una auditoria externa mitjançant l'API **JSON-2**.

#### 1. Preparació de l'entorn i permisos de Docker
Com a usuari `sudoer` en el vostre VPS, heu de configurar el sistema per a poder executar comandaments de Docker sense escriure `sudo` cada vegada.
*   **Tasca:** Afegeix el teu usuari al grup `docker`.

#### 2. Instal·lació de Docker Compose
Heu d'instal·lar  Docker Compose si no està disponible en la vostra imatge de VPS.

#### 3. Desplegament d'Odoo 19
Creeu un directori de treball i un fitxer `docker-compose.yml` que incloga els serveis d'Odoo (imatge `odoo:19.0`) i PostgreSQL.

#### 4. Configuració del Producte en Odoo
Una vegada el servei estiga actiu (pots comprovar-ho al navegador en `http://la_teua_ip:8069`):
1.  Crea una base de dades nova.
2.  Instal·la el mòdul de **Vendes** o **Inventari**.
3.  Crea un nou producte amb el nom exacte: **`Producte_Prova_API`**.

#### 5. Activació de l'API JSON-2 i Seguretat
L'avaluació es realitzarà de forma externa. Odoo 19 utilitza l'API **JSON-2** que requereix autenticació per **API Key**.
*   **Tasca:** Ves a la configuració de l'usuari administrador, a la pestanya de seguretat, i genera una **API Key**.
*   **Important:** Hauràs de facilitar aquesta clau a un fitxer anomenat `api_key.txt` al home del teu usuari del VPS.

---

### Sistema d'Avaluació Automàtica
L'avaluació es farà des d'una web centralitzada que utilitzarà el mètode `fetch` per a enviar peticions **POST** a la ruta `/json/2/product.template/search_read` de cada IP dels alumnes.

**Codi base de la web d'avaluació (exemple de petició):**
```javascript
async function verificarAlumne(ip, apiKey) {
    const resposta = await fetch(`http://${ip}:8069/json/2/product.template/search_read`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}` // Autenticació Bearer amb l'API Key
        },
        body: JSON.stringify({
            params: {
                domain: [["name", "=", "Producte_Prova_API_2026"]],
                fields: ["name", "list_price"]
            }
        })
    });
    const dades = await resposta.json();
    return dades.result.length > 0; // Si troba el producte, la pràctica és apta
}
```

**Criteris d'avaluació automàtica:**
*   **Connectivitat:** La IP ha de respondre al port 8069.
*   **Autenticació:** L'API Key ha de ser vàlida per a l'API JSON-2.
*   **Integritat:** La petició ha de retornar exactament el producte amb el nom indicat en la base de dades d'Odoo 19.
*   **Sistema**: El sistema ha de ser capaç de gestionar els contenidors Docker sense necessitat de `sudo`.