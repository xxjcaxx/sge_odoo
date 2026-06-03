
### Pràctica: Sistema de Venda d'Entrades "Anti-Revenda"

**Objectiu:** Crear un mòdul anomenat `venda_entrades_segures` que gestione entrades nominals, on la majoria de la informació es calcule automàticament per evitar manipulacions i garantir la identitat del comprador.

Aquesta pràctica servirà per provar els `fields computed`.

#### 1. Models Requerits
Heu de definir els següents models:
*   `venda_entrades_segures.esdeveniment`: Representa el concert o espectacle. (Fields: name, preu_base)
*   `venda_entrades_segures.tiquet`: Representa l'entrada individual (model principal de la pràctica).
*   `venda_entrades_segures.etiqueta`: Representa etiquetes "tags" que tenen les entrades. 

#### 2. Definició de Fields en `venda_entrades_segures.tiquet`
Heu d'implementar els següents camps seguint les especificacions tècniques:

*   **Many2one (m2o):** `comprador_id` (cap al model `res.partner`).
*   **Many2one:** `esdeveniment_id`.
*   **Numerical (Float):** `preu_final`. **Computed i amb `store=True`**. Ha de calcular-se sumant el preu base de l'esdeveniment més una taxa de gestió fixa del 10%. Ha d'utilitzar `@api.depends` de l'esdeveniment. 
*   **Char Computed:** `codi_seguretat`. Ha de generar una cadena de text única combinant el nom del comprador i l'ID de l'esdeveniment (p. ex: "NOM-ID-123").
*   **Datetime Computed:** `data_limit_acces`. Es calcula restant 2 hores a la data d'inici de l'esdeveniment.
*   **Image Computed:** `foto_comprador`. Ha d'agafar automàticament la imatge del `res.partner` associat al `comprador_id`.
*   **HTML Computed:** `clausules_legals`. Ha de generar un text amb format HTML que incloga el nom del comprador en negreta i les condicions de no-revenda.
*   **Many2many (m2m) amb valor per defecte:** `etiquetes_ids`. Heu de crear una funció de Python que retorne per defecte l'ID de l'etiqueta "Nominal" i "No Reemborsable" en crear el registre.
*   **Many2many Computed:** `entrades_relacionades_ids`. Ha de mostrar totes les altres entrades que s'hagen comprat per al mateix esdeveniment des de la mateixa sessió o pel mateix comprador.

#### 3. Requisits del Codi (Python)
*   **Decoradors:** Tots els camps computed han d'utilitzar `@api.depends` per especificar de quins camps depenen (per exemple, `preu_final` depèn del preu base).
*   **Iteració:** Recordeu que dins de les funcions `_compute_` cal iterar sobre `self` (usant `for record in self:`) per a gestionar correctament tant les vistes formulari com les de llista.
*   **Funció per defecte:** El camp `etiquetes_ids` ha de cridar a un mètode (p. ex. `_get_default_tags`) que utilitze `self.env.ref()` per a buscar els identificadors externs de les etiquetes.


#### 5. Entrega
Proporcioneu a la web de l'assignatura:
*   L'URL del vostre repositori Git amb el mòdul.
*   L'adreça IP del VPS on Odoo està corrent en Docker.
*   El nom del model i el mètode de l'API Key per a la consulta JSON-2.