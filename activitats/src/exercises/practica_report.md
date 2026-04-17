

### Pràctica: Generador d'Entrades Segures "Anti-Revenda"

**Objectiu:** Crear un sistema de generació d'entrades PDF a partir d'una comanda de venda (`sale.order`). L'entrada ha de ser única, incloure un codi QR de validació i tenir un format de paper personalitzat.

#### 1. Herència del Model `sale.order`
Per a gestionar la seguretat, primer cal preparar les dades al model original.
*   **Tasca:** Hereta el model `sale.order` i afegeix:
    *   Un camp `token_seguretat` (Char, computed o per defecte) que genere una cadena aleatòria única per a cada comanda.
    *   Un camp relacional o directament al producte per a emmagatzemar el **logo del grup o banda** (Binary/Image).
*   **Dada codificada:** Crea un camp computat anomenat `qr_data` que combine el nom del comprador (`partner_id.name`) i el `token_seguretat`.

#### 2. Definició de l'Acció del Report
Heu de crear un registre en el model `ir.actions.report` perquè el botó d'imprimir aparega a la vista formulari de la comanda de venda.
*   **Requisits de l'XML:**
    *   `name`: "Entrada de Seguretat".
    *   `model`: `sale.order`.
    *   `report_type`: `qweb-pdf`.
    *   `print_report_name`: Un nom de fitxer dinàmic (ex: "Entrada_" + object.name).

#### 3. Disseny de la Plantilla QWeb
Creeu una vista QWeb que definisca l'aspecte de l'entrada.
*   **Elements obligatoris:**
    *   **Logo:** Mostra el logo de la banda usant l'atribut `t-att-src` per a dades en base64.
    *   **Dades del Comprador:** Nom del client i dades de la comanda (data i referència).
    *   **Codi QR:** Utilitza la sintaxi nativa d'Odoo per a generar el codi QR a partir del camp 
    *   **Layout:** Utilitza `t-call="web.basic_layout"` per a evitar les capçaleres estàndard d'empresa i centrar-te en el disseny de l'entrada.

#### 4. Format de Paper Personalitzat
L'entrada no s'ha d'imprimir en un A4 estàndard. Heu de definir un **Paper Format**.
*   **Tasca:** Crea un registre `ir.actions.report.paperformat` amb:
    *   Dimensions adaptades (ex: 80mm x 150mm).
    *   Orientació `portrait` o `landscape`.
    *   Vincula aquest format a l'acció del report creada al punt 2.

---

### Avaluació Automàtica i Entrega

El professor utilitzarà una eina de validació que realitzarà les següents comprovacions:

1.  **Existència del Report:** Mitjançant l'API **JSON-2**, es verificarà que existeix un registre a `ir.actions.report` vinculat al model `sale.order`.
2.  **Validació de l'HTML (Fetch):** El sistema realitzarà una petició a l'URL del report en format HTML (`/report/html/<report_name>/<ids>`) i analitzarà el codi font per a confirmar que:
    *   Existeix una etiqueta `<img>` amb el tipus `QR`.
    *   Apareix el nom del comprador dins del contingut.
3.  **Entrega del PDF:** L'alumne haurà de descarregar el PDF generat per Odoo i penjar-lo a la web de l'assignatura. El sistema comprovarà mitjançant metadades que el fitxer ha estat generat per **Wkhtmltopdf** i que les dimensions del paper coincideixen amb les definides.

**Nota d'entrega:** Heu de proporcionar l'**External ID** del vostre report i l'adreça IP del vostre VPS on corre el contenidor de Docker amb Odoo 19.